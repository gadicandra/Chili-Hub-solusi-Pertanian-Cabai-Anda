// ---------------------------------------------------------------- //
//                    ESP32 ML Client (Smart IoT)                   //
// ---------------------------------------------------------------- //

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h> 

// ------------------- WiFi & MQTT Configuration ------------------ //
const char* WIFI_SSID = "Wifi";
const char* WIFI_PASSWORD = "113333555555";

const char* MQTT_BROKER = "broker.emqx.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "esp32_chilihub_client_001"; 

const char* TOPIC_PUBLISH_DATA = "chilihub/data/sensors";
const char* TOPIC_SUBSCRIBE_PRED = "chilihub/predictions/class";

// ----------------------- Pin Definitions ------------------------ //
const int PHOTO_PIN = 33;      
const int DHT1_PIN = 5;       
const int SOIL_PIN = 32;       

// Actuators
const int GREEN_LED_PIN = 12;   // Code 0: Normal
const int YELLOW_LED_PIN = 14;  // Code 1: Warning
const int RED2_LED_PIN = 25;    // Code 2: Critical
const int SERVO_PIN = 23;      

// -------------------- Global Objects & Variables ---------------- //
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define DHTTYPE DHT22
DHT dht1(DHT1_PIN, DHTTYPE);

Servo myServo;

// Variabel Sensor
int lightValueADC = 0;
float lightValue = 0;
float temp1 = 0;
float humidity1 = 0; 
float humidity2 = 0; 

// Variabel Status (Dari Server)
int currentCode = -1; 
int lastCode = -1;
int currentServoPos = 0;
String currentStatus = "Waiting...";
String lastTimestamp = "--:--:--";

unsigned long lastReadTime = 0;
const long readInterval = 5000; 

// ========== EDGE CASE: Sensor Error Tracking ========== //
struct SensorHealth {
    bool dht_ok = true;
    bool photo_ok = true;
    bool soil_ok = true;
    int dht_fail_count = 0;
    int photo_fail_count = 0;
    int soil_fail_count = 0;
};

SensorHealth sensorStatus;

// Threshold untuk deteksi sensor rusak
const int MAX_FAIL_COUNT = 3;

// Default values jika sensor rusak
const float DEFAULT_TEMP = 25.0;
const float DEFAULT_HUMIDITY_AIR = 60.0;
const float DEFAULT_HUMIDITY_SOIL = 50.0;
const float DEFAULT_LUX = 1000.0;

// -------------------------- SETUP ------------------------------- //
void setup() {
    Serial.begin(115200);

    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(YELLOW_LED_PIN, OUTPUT);
    pinMode(RED2_LED_PIN, OUTPUT);

    myServo.attach(SERVO_PIN);
    myServo.write(0);
    delay(500);
    myServo.detach();

    Wire.begin(21, 22);
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 failed"));
        for (;;);
    }
    
    dht1.begin();
    
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback); 

    connectWiFi();
    testAllSensors();
}

// --------------------------- LOOP ------------------------------- //
void loop() {
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop(); 

    if (millis() - lastReadTime > readInterval) {
        readSensors();
        publishSensorDataJSON(); 
        updateDisplay();
        lastReadTime = millis();
    }
}

// ========== SENSOR TESTING & VALIDATION ========== //

void testAllSensors() {
    Serial.println("\n===== TESTING SENSORS =====");
    
    // Test DHT22
    float testTemp = dht1.readTemperature();
    float testHum = dht1.readHumidity();
    if (isnan(testTemp) || isnan(testHum)) {
        sensorStatus.dht_ok = false;
        Serial.println("⚠️  DHT22: FAILED");
    } else {
        sensorStatus.dht_ok = true;
        Serial.println("✅ DHT22: OK");
    }
    
    // Test Photoresistor
    int testPhoto = analogRead(PHOTO_PIN);
    if (testPhoto < 0 || testPhoto > 4095) {
        sensorStatus.photo_ok = false;
        Serial.println("⚠️  Photo Sensor: FAILED");
    } else {
        sensorStatus.photo_ok = true;
        Serial.println("✅ Photo Sensor: OK");
    }
    
    // Test Soil Moisture
    int testSoil = analogRead(SOIL_PIN);
    if (testSoil < 0 || testSoil > 4095) {
        sensorStatus.soil_ok = false;
        Serial.println("⚠️  Soil Sensor: FAILED");
    } else {
        sensorStatus.soil_ok = true;
        Serial.println("✅ Soil Sensor: OK");
    }
    
    Serial.println("===========================\n");
}

// ------------------- MQTT Callback ------------------- //
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String message = "";
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.print("JSON Received: ");
    Serial.println(message);

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
    }

    const char* statusStr = doc["status"];
    int code = doc["code"]; 
    const char* ts = doc["timestamp"];

    currentStatus = String(statusStr);
    currentCode = code;
    lastTimestamp = String(ts);

    actuateBasedOnCode(currentCode);
    
    updateDisplay(); 
}

// ------------------- Logic Aktuator ------------------- //
void actuateBasedOnCode(int code) {

    if (code == lastCode) {
        return;
    }

    lastCode = code;

    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED2_LED_PIN, LOW);

    switch (code) {
        case 0: // Normal - Green LED
            digitalWrite(GREEN_LED_PIN, HIGH);
            if (currentServoPos != 0) {
                myServo.attach(SERVO_PIN);
                myServo.write(0);
                delay(500);
                myServo.detach();
                currentServoPos = 0;
                Serial.println("Servo → 0° (Closed)");
            }
            break;

        case 1: // Warning - Yellow LED
            digitalWrite(YELLOW_LED_PIN, HIGH);
            if (currentServoPos != 45) {
                myServo.attach(SERVO_PIN);
                myServo.write(45);
                delay(500);
                myServo.detach();
                currentServoPos = 45;
                Serial.println("Servo → 45° (Warning)");
            }
            break;

        case 2: // Critical - Red LED + Servo Open
            digitalWrite(RED2_LED_PIN, HIGH);
            if (currentServoPos != 90) {
                myServo.attach(SERVO_PIN);
                myServo.write(90);
                delay(500);
                currentServoPos = 90;
                Serial.println("Servo → 90° (OPEN - CRITICAL!)");
            }
            break;

        default:
            Serial.println("Unknown code");
            break;
    }
}

// ------------------- Reading & Publishing ------------------- //
void readSensors() {
    // ===== 1. DHT22 Temperature & Humidity ===== //
    temp1 = dht1.readTemperature();
    humidity1 = dht1.readHumidity();
    
    if (isnan(temp1) || isnan(humidity1)) {
        sensorStatus.dht_fail_count++;
        Serial.println("⚠️  DHT22 read failed");
        
        if (sensorStatus.dht_fail_count >= MAX_FAIL_COUNT) {
            sensorStatus.dht_ok = false;
            Serial.println("❌ DHT22 SENSOR RUSAK - Using default values");
        }
        
        // Gunakan nilai default
        temp1 = DEFAULT_TEMP;
        humidity1 = DEFAULT_HUMIDITY_AIR;
    } 
    // Validasi range nilai yang wajar
    else if (temp1 < 5 || temp1 > 45 || humidity1 < 0 || humidity1 > 100) {
        sensorStatus.dht_fail_count++;
        Serial.println("⚠️  DHT22 values out of range");
        
        temp1 = DEFAULT_TEMP;
        humidity1 = DEFAULT_HUMIDITY_AIR;
    }
    else {
        // Sensor OK, reset fail counter
        sensorStatus.dht_fail_count = 0;
        sensorStatus.dht_ok = true;
    }
    
    // ===== 2. Photoresistor (Light Sensor) ===== //
    lightValueADC = analogRead(PHOTO_PIN);
    
    if (lightValueADC < 0 || lightValueADC > 4095) {
        sensorStatus.photo_fail_count++;
        Serial.println("⚠️  Photo sensor read failed");
        
        if (sensorStatus.photo_fail_count >= MAX_FAIL_COUNT) {
            sensorStatus.photo_ok = false;
            Serial.println("❌ PHOTO SENSOR RUSAK - Using default value");
        }
        
        lightValue = DEFAULT_LUX;
    } else {
        sensorStatus.photo_fail_count = 0;
        sensorStatus.photo_ok = true;
        lightValue = convertToLux(lightValueADC);
    }
    
    // ===== 3. Soil Moisture Sensor ===== //
    int soilRaw = analogRead(SOIL_PIN);
    
    if (soilRaw < 0 || soilRaw > 4095) {
        sensorStatus.soil_fail_count++;
        Serial.println("⚠️  Soil sensor read failed");
        
        if (sensorStatus.soil_fail_count >= MAX_FAIL_COUNT) {
            sensorStatus.soil_ok = false;
            Serial.println("❌ SOIL SENSOR RUSAK - Using default value");
        }
        
        humidity2 = DEFAULT_HUMIDITY_SOIL;
    } else {
        sensorStatus.soil_fail_count = 0;
        sensorStatus.soil_ok = true;
        humidity2 = map(soilRaw, 4095, 0, 0, 100);
        
        if (humidity2 < 0) humidity2 = 0;
        if (humidity2 > 100) humidity2 = 100;
    }
    
    // Print sensor readings
    Serial.println("--- Sensor Readings ---");
    Serial.print("Temp: "); Serial.print(temp1); 
    if (!sensorStatus.dht_ok) Serial.print(" [DEFAULT]");
    Serial.println(" °C");
    
    Serial.print("Humidity Air: "); Serial.print(humidity1); 
    if (!sensorStatus.dht_ok) Serial.print(" [DEFAULT]");
    Serial.println(" %");
    
    Serial.print("Humidity Soil: "); Serial.print(humidity2); 
    if (!sensorStatus.soil_ok) Serial.print(" [DEFAULT]");
    Serial.println(" %");
    
    Serial.print("Light: "); Serial.print(lightValue); 
    if (!sensorStatus.photo_ok) Serial.print(" [DEFAULT]");
    Serial.println(" lux");
    Serial.println("----------------------");
}

void publishSensorDataJSON() {
    JsonDocument doc;
    doc["temp"] = temp1;
    doc["rh_air"] = humidity1;
    doc["rh_soil"] = humidity2;
    doc["lux"] = lightValue;

    JsonObject sensors = doc.createNestedObject("sensor_health");
    sensors["dht_ok"] = sensorStatus.dht_ok;
    sensors["photo_ok"] = sensorStatus.photo_ok;
    sensors["soil_ok"] = sensorStatus.soil_ok;
    
    char buffer[256];
    serializeJson(doc, buffer);
    
    mqttClient.publish(TOPIC_PUBLISH_DATA, buffer);
}

// ------------------- Display Update ------------------- //

void updateDisplay() {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    
    // Baris 1: Status
    display.setCursor(0, 0);
    display.print("STS: "); 
    if(currentStatus.length() > 10) display.println(currentStatus.substring(0,10));
    else display.println(currentStatus);
    
    // Baris 2: Timestamp
    display.setCursor(0, 12);
    display.print("Time: "); display.println(lastTimestamp);

    // Baris 3: Sensor Values
    display.setCursor(0, 25);
    display.print("T:"); display.print((int)temp1);
    if (!sensorStatus.dht_ok) display.print("*");  // Tanda sensor rusak
    
    display.print(" H:"); display.print((int)humidity1);
    if (!sensorStatus.dht_ok) display.print("*");
    
    display.print(" S:"); display.print((int)humidity2);
    if (!sensorStatus.soil_ok) display.print("*");

    // Baris 4: Light
    display.setCursor(0, 37);
    display.print("Lux: "); display.print((int)lightValue);
    if (!sensorStatus.photo_ok) display.print("*");

    // Baris 5: Code dan Warning
    display.setCursor(0, 50);
    display.print("Code: "); display.print(currentCode);
    if(currentCode == 2) display.print(" !ACT!");

    // Sensor error indicator
    if (!sensorStatus.dht_ok || !sensorStatus.photo_ok || !sensorStatus.soil_ok) {
        display.setCursor(0, 57);
        display.print("*=SENSOR ERROR");
    }

    display.display();
}

// ========== HELPER FUNCTIONS ========== //

float convertToLux(int adcValue) {
    if (adcValue == 0) adcValue = 1;
    float voltage = (adcValue / 4095.0) * 3.3;
    float resistance = (10000.0 * voltage) / (3.3 - voltage);

    // Edge case: resistance terlalu tinggi atau rendah
    if (resistance < 1 || resistance > 1000000) {
        return DEFAULT_LUX;
    }

    float lux = pow(10, (log10(resistance / 10000.0) * -1.25) + 4);
    return constrain(lux, 0, 100000);
}

void connectWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ WiFi Connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
    while (!mqttClient.connected()) {
        Serial.print("Connecting MQTT...");
        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("Ready");
            mqttClient.subscribe(TOPIC_SUBSCRIBE_PRED); 
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            delay(5000);
        }
    }
}