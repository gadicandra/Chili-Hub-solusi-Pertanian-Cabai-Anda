// ---------------------------------------------------------------- //
//                  ESP32 Multi-Sensor IoT Project                  //
// ---------------------------------------------------------------- //
// Libraries for WiFi, MQTT, Sensors, and Display
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <ESP32Servo.h>

// ------------------- WiFi & MQTT Configuration ------------------ //
// Replace with your WiFi credentials if not using Wokwi's default
const char* WIFI_SSID = "Wifi";
const char* WIFI_PASSWORD = "113333555555";

// MQTT Broker settings
const char* MQTT_BROKER = "broker.emqx.io";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "mqttx_044ec2b3"; // Make this unique

// MQTT Topics
const char* LIGHT_TOPIC = "esp32/sensors/luminance";
const char* TEMP_HUMID1_TOPIC = "esp32/sensors/humidityAndTemperatureOfAir";
const char* HUMIDITY2_TOPIC = "esp32/sensors/humidityOfEarth";
const char* SERVO_TOPIC = "esp32/actuator/servo";

// ----------------------- Pin Definitions ------------------------ //
// Sensor PinsUSB
const int PHOTO_PIN = 33;      // Photoresistor Analog Out
const int DHT1_PIN = 5;       // DHT11 Data Pin
const int SOIL_PIN = 32;       // Soil Moisture Pin


// Actuator Pins
const int RED1_LED_PIN = 12;    // Light level indicator
const int GREEN_LED_PIN = 14;  // Temperature indicator
const int YELLOW_LED_PIN = 27;    // Air Humidity indicator
const int RED2_LED_PIN = 26;  // Earth Humidity indicator
const int SERVO_PIN = 23;      // Servo motor signal

// -------------------- Threshold Definitions --------------------- //
// Adjust these values to change the trigger points
const int LIGHT_UPPER_THRESHOLD = 10000;       // For photoresistor in lux (8k lux = 183)
const int LIGHT_UNDER_THRESHOLD = 8000;
const float TEMP_UPPER_THRESHOLD = 26.0;      // For air temperature in Celsius
const float TEMP_UNDER_THRESHOLD = 18.0;
const float HUMIDITY1_UPPER_THRESHOLD = 85.0; // For air humidity in %
const float HUMIDITY1_UNDER_THRESHOLD = 65.0;
const float HUMIDITY2_UPPER_THRESHOLD = 80.0; // For soil moisture in %
const float HUMIDITY2_UNDER_THRESHOLD = 60.0;


// -------------------- Global Objects & Variables ---------------- //
// WiFi and MQTT clients
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

// OLED Display (128x64)
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// DHT Sensors
#define DHTTYPE DHT22
DHT dht1(DHT1_PIN, DHTTYPE);

// Servo Motor
Servo myServo;

// Variables to hold sensor readings
int lightValueADC = 0;
float lightValue = 0;
float temp1 = 0;
float humidity1 = 0;
float humidity2 = 0;
String servoState = "OFF";
String temp_humid1 = "";

// Variables for timing and display cycling
unsigned long lastReadTime = 0;
const long readInterval = 2000; // Read sensors every 2 seconds
int displayState = 0; // To cycle through display data

// Variables for Servo Handling
unsigned long lastServoChange = 0;
const unsigned long SERVO_DEBOUNCE = 5000;

// -------------------------- SETUP ------------------------------- //
void setup() {
    Serial.begin(115200);

    // Initialize Pins
    pinMode(RED1_LED_PIN, OUTPUT);
    pinMode(GREEN_LED_PIN, OUTPUT);
    pinMode(YELLOW_LED_PIN, OUTPUT);
    pinMode(RED2_LED_PIN, OUTPUT);

    // Initialize Servo
    myServo.attach(SERVO_PIN);
    myServo.write(0); // Start at 0 degrees

    // Initialize I2C
    Wire.begin(21, 22);

    // Initialize OLED Display
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;);
    }
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.println("Initializing...");
    display.display();

    // Initialize DHT sensors
    dht1.begin();

    // Connect to WiFi and MQTT
    connectWiFi();
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
}

// --------------------------- LOOP ------------------------------- //
void loop() {
    // Ensure MQTT client is connected
    if (!mqttClient.connected()) {
        reconnectMQTT();
    }
    mqttClient.loop();

    // Read sensors and update logic at a fixed interval
    if (millis() - lastReadTime > readInterval) {
        readSensors();
        updateLogic();
        publishData();
        updateDisplay();
        lastReadTime = millis();
        delay(2000);
    }
}

// ------------------- Core Functions ------------------- //

void readSensors() {
    lightValueADC = analogRead(PHOTO_PIN);
    lightValue = convertToLux(lightValueADC);

    // Reading from DHT sensors can take a moment
    temp1 = dht1.readTemperature();
    humidity1 = dht1.readHumidity();

    // Reading from Soil Moisture Sensor
    humidity2 = analogRead(SOIL_PIN);
    humidity2 = map(humidity2, 4095, 0, 0, 100);

    // Check if any reads failed and exit early (to try again).
    if (isnan(temp1) || isnan(humidity1)) {
        Serial.println(F("Failed to read from DHT sensor!"));
        return;
    }
}

void updateLogic() {
    // 1. Photoresistor -> Red1 LED
    digitalWrite(RED1_LED_PIN, lightValue >= LIGHT_UNDER_THRESHOLD && lightValue <= LIGHT_UPPER_THRESHOLD ? LOW : HIGH);

    // 2. Temperature (DHT) -> Green LED
    digitalWrite(GREEN_LED_PIN, temp1 >= TEMP_UNDER_THRESHOLD && temp1 <= TEMP_UPPER_THRESHOLD ? LOW : HIGH);

    // 3. Humidity (DHT) -> Yellow LED
    digitalWrite(YELLOW_LED_PIN, humidity1 >= HUMIDITY1_UNDER_THRESHOLD && humidity1 <= HUMIDITY1_UPPER_THRESHOLD ? LOW : HIGH);

    // 4. Humidity (Soil Moisture) -> Red2 LED
    digitalWrite(RED2_LED_PIN, humidity2 >= HUMIDITY2_UNDER_THRESHOLD && humidity2 <= HUMIDITY2_UPPER_THRESHOLD ? LOW : HIGH);

    // 5. Humidity (Soil Moisture) -> Servo
    if (millis() - lastServoChange > SERVO_DEBOUNCE) {
        if (humidity2 < HUMIDITY2_UNDER_THRESHOLD && servoState == "OFF") {
            myServo.write(90);
            servoState = "ON";
            lastServoChange = millis();
        } else if (humidity2 > HUMIDITY2_UPPER_THRESHOLD && servoState == "ON") {
            myServo.write(0);
            servoState = "OFF";
            lastServoChange = millis();
        }
    }
    Serial.println(lightValue);
    Serial.println(temp1);
    Serial.println(humidity1);
    Serial.println(humidity2);
    Serial.println(servoState);
}

void publishData() {
    temp_humid1 = String(humidity1) + "," + String(temp1);
    
    // Publish all sensor data to their respective MQTT topics
    mqttClient.publish(LIGHT_TOPIC, String(lightValue, 2).c_str(), true);
    mqttClient.publish(TEMP_HUMID1_TOPIC, temp_humid1.c_str(), true);
    mqttClient.publish(HUMIDITY2_TOPIC, String(humidity2).c_str(), true);
    mqttClient.publish(SERVO_TOPIC, servoState.c_str(), true);
    Serial.println("Data published to MQTT.");
}

void updateDisplay() {
    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(2);

    // Cycle through which sensor data to show
    switch (displayState) {
        case 0:
            display.println(F("Light"));
            display.println(lightValue, 0);
            break;
        case 1:
            display.println(F("Temp C"));
            display.println(temp1);
            break;
        case 2:
            display.println(F("Air Humid %"));
            display.println(humidity1);
            break;
        case 3:
            display.println(F("Earth Humid %"));
            display.println(humidity2);
            break;
        case 4:
            display.println(F("Servo"));
            display.println(servoState);
            break;
    }
    
    display.display();

    // Increment state for the next cycle
    displayState++;
    if (displayState > 4) {
        displayState = 0;
    }
}


// ------------------- Helper Functions ------------------- //

float convertToLux(int adcValue) {
    if (adcValue == 0) adcValue = 1;

    float voltage = (adcValue / 4095.0) * 3.3;
    float resistance = (10000.0 * voltage) / (3.3 - voltage);
    
    float lux = pow(10, (log10(resistance / 10000.0) * -1.25) + 4);
    return constrain(lux, 0, 100000);
}

void connectWiFi() {
    Serial.print("Connecting to WiFi...");
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("Connecting WiFi...");
    display.display();
    
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {  // Max 10 detik
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
        display.println("WiFi Connected!");
    } else {
        Serial.println("\nWiFi connection failed!");
        display.println("WiFi Failed!");
    }
    
    display.display();
    delay(1000);
}

void reconnectMQTT() {
    static unsigned long lastAttempt = 0;
    
    // Hanya coba reconnect setiap 5 detik
    if (millis() - lastAttempt < 5000) return;
    lastAttempt = millis();
    
    if (!mqttClient.connected()) {
        Serial.print("Attempting MQTT connection...");
        display.clearDisplay();
        display.setCursor(0,0);
        display.println("Connecting MQTT...");
        display.display();

        if (mqttClient.connect(MQTT_CLIENT_ID)) {
            Serial.println("connected");
            display.println("MQTT Connected!");
            display.display();
            delay(1000);
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(" try again in 5 seconds");
            display.println("MQTT Failed!");
            display.display();
        }
    }
}
