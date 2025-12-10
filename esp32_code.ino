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
String currentStatus = "Waiting...";
String lastTimestamp = "--:--:--";

unsigned long lastReadTime = 0;
const long readInterval = 5000; 

// -------------------------- SETUP ------------------------------- //
void setup() {
    Serial.begin(115200);

    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(YELLOW_LED_PIN, OUTPUT);
    pinMode(RED2_LED_PIN, OUTPUT);

    myServo.attach(SERVO_PIN);
    myServo.write(0); 

    Wire.begin(21, 22);
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 failed"));
        for (;;);
    }
    
    dht1.begin();
    
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback); 

    connectWiFi();
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
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(YELLOW_LED_PIN, LOW);
    digitalWrite(RED2_LED_PIN, LOW);
    myServo.write(0);

    switch (code) {
        case 0:
            digitalWrite(GREEN_LED_PIN, HIGH);
            // Servo Tetap 0 (Tutup)
            break;

        case 1:
            digitalWrite(YELLOW_LED_PIN, HIGH);
            // Servo Tetap 0 (Tutup)
            break;

        case 2:
            digitalWrite(RED2_LED_PIN, HIGH);
            myServo.write(90); 
            break;

        default:
            break;
    }
}

// ------------------- Reading & Publishing ------------------- //

void readSensors() {
    lightValueADC = analogRead(PHOTO_PIN);
    lightValue = convertToLux(lightValueADC);
    temp1 = dht1.readTemperature();
    humidity1 = dht1.readHumidity();
    
    int soilRaw = analogRead(SOIL_PIN);
    humidity2 = map(soilRaw, 4095, 0, 0, 100);

    if (isnan(temp1)) temp1 = 0;
    if (isnan(humidity1)) humidity1 = 0;
}

void publishSensorDataJSON() {
    JsonDocument doc;
    doc["temp"] = temp1;
    doc["rh_air"] = humidity1;
    doc["rh_soil"] = humidity2;
    doc["lux"] = lightValue;
    
    char buffer[256];
    serializeJson(doc, buffer);
    
    mqttClient.publish(TOPIC_PUBLISH_DATA, buffer);
}

// ------------------- Display Update ------------------- //

void updateDisplay() {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    
    display.setCursor(0, 0);
    display.print("STS: "); 
    if(currentStatus.length() > 10) display.println(currentStatus.substring(0,10));
    else display.println(currentStatus);
    
    display.setCursor(0, 12);
    display.print("Time: "); display.println(lastTimestamp);

    display.setCursor(0, 25);
    display.print("T:"); display.print((int)temp1);
    display.print(" H:"); display.print((int)humidity1);
    display.print(" S:"); display.print((int)humidity2);

    display.setCursor(0, 50);
    display.print("Code: "); display.print(currentCode);
    if(currentCode == 2) display.print(" !ACT!");

    display.display();
}

float convertToLux(int adcValue) {
    if (adcValue == 0) adcValue = 1;
    float voltage = (adcValue / 4095.0) * 3.3;
    float resistance = (10000.0 * voltage) / (3.3 - voltage);
    float lux = pow(10, (log10(resistance / 10000.0) * -1.25) + 4);
    return constrain(lux, 0, 100000);
}

void connectWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected");
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