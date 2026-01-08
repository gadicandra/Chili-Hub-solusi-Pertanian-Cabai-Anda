// MQTT Service for ChiliHub IoT
// Connects to EMQX broker for real-time sensor data

import { Client, Message } from 'react-native-mqtt';
import { SensorData, PredictionResult } from '../types/types';

// MQTT Configuration
const MQTT_CONFIG = {
    broker: 'broker.emqx.io',
    port: 1883,
    clientId: `chilihub_mobile_${Date.now()}`,
};

// Topics
export const MQTT_TOPICS = {
    SENSOR_DATA: 'chilihub/data/sensors',
    PREDICTION: 'chilihub/predictions/class',
};

type SensorDataCallback = (data: SensorData) => void;
type PredictionCallback = (data: PredictionResult) => void;

class MqttService {
    private client: Client | null = null;
    private isConnected: boolean = false;
    private sensorDataCallbacks: SensorDataCallback[] = [];
    private predictionCallbacks: PredictionCallback[] = [];
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;

    async connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                // Create client
                this.client = new Client({
                    uri: `mqtt://${MQTT_CONFIG.broker}:${MQTT_CONFIG.port}`,
                    clientId: MQTT_CONFIG.clientId,
                });

                // Set up event handlers
                this.client.on('closed', () => {
                    console.log('[MQTT] Connection closed');
                    this.isConnected = false;
                    this.handleDisconnect();
                });

                this.client.on('error', (error: string) => {
                    console.error('[MQTT] Error:', error);
                    this.isConnected = false;
                });

                this.client.on('message', (message: Message) => {
                    this.handleMessage(message);
                });

                // Connect
                this.client.connect()
                    .then(() => {
                        console.log('[MQTT] Connected to broker');
                        this.isConnected = true;
                        this.reconnectAttempts = 0;
                        this.subscribeToTopics();
                        resolve(true);
                    })
                    .catch((error: Error) => {
                        console.error('[MQTT] Connection failed:', error);
                        reject(error);
                    });
            } catch (error) {
                console.error('[MQTT] Setup error:', error);
                reject(error);
            }
        });
    }

    private subscribeToTopics(): void {
        if (!this.client || !this.isConnected) return;

        // Subscribe to sensor data
        this.client.subscribe(MQTT_TOPICS.SENSOR_DATA, 0)
            .then(() => console.log(`[MQTT] Subscribed to ${MQTT_TOPICS.SENSOR_DATA}`))
            .catch((error: Error) => console.error('[MQTT] Subscribe error:', error));

        // Subscribe to prediction results
        this.client.subscribe(MQTT_TOPICS.PREDICTION, 0)
            .then(() => console.log(`[MQTT] Subscribed to ${MQTT_TOPICS.PREDICTION}`))
            .catch((error: Error) => console.error('[MQTT] Subscribe error:', error));
    }

    private handleMessage(message: Message): void {
        const topic = message.topic;
        const payload = message.data;

        try {
            const data = JSON.parse(payload.toString());

            if (topic === MQTT_TOPICS.SENSOR_DATA) {
                // Parse sensor data
                const sensorData: SensorData = {
                    temp: data.temp || 0,
                    rh_air: data.rh_air || 0,
                    rh_soil: data.rh_soil || 0,
                    lux: data.lux || 0,
                    sensor_health: {
                        dht_ok: data.sensor_health?.dht_ok ?? true,
                        photo_ok: data.sensor_health?.photo_ok ?? true,
                        soil_ok: data.sensor_health?.soil_ok ?? true,
                    },
                };

                // Notify all callbacks
                this.sensorDataCallbacks.forEach(callback => callback(sensorData));
            }

            if (topic === MQTT_TOPICS.PREDICTION) {
                // Parse prediction data
                const prediction: PredictionResult = {
                    status: data.status || 'NORMAL',
                    code: data.code || 0,
                    timestamp: data.timestamp || new Date().toLocaleTimeString(),
                    sensors_ok: data.sensors_ok ?? true,
                };

                // Notify all callbacks
                this.predictionCallbacks.forEach(callback => callback(prediction));
            }
        } catch (error) {
            console.error('[MQTT] Message parse error:', error);
        }
    }

    private handleDisconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[MQTT] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                this.connect().catch(console.error);
            }, 5000); // Wait 5 seconds before reconnecting
        }
    }

    // Register callback for sensor data updates
    onSensorData(callback: SensorDataCallback): () => void {
        this.sensorDataCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.sensorDataCallbacks = this.sensorDataCallbacks.filter(cb => cb !== callback);
        };
    }

    // Register callback for prediction updates  
    onPrediction(callback: PredictionCallback): () => void {
        this.predictionCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.predictionCallbacks = this.predictionCallbacks.filter(cb => cb !== callback);
        };
    }

    // Publish a message to a topic
    async publish(topic: string, message: string): Promise<void> {
        if (!this.client || !this.isConnected) {
            throw new Error('Not connected to MQTT broker');
        }

        return this.client.publish(topic, message, 0, false);
    }

    // Disconnect from broker
    disconnect(): void {
        if (this.client) {
            this.client.disconnect();
            this.isConnected = false;
            this.client = null;
        }
    }

    // Get connection status
    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

// Singleton instance
export const mqttService = new MqttService();
export default mqttService;
