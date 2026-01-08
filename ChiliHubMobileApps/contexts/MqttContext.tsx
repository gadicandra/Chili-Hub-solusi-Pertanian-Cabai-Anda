// MQTT Context for ChiliHub IoT
// Uses WebSocket MQTT for Expo Go compatibility

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SensorData, PredictionResult } from '../types/types';

// MQTT Configuration - Using WebSocket port for Expo Go compatibility
const MQTT_CONFIG = {
    broker: 'broker.emqx.io',
    wsPort: 8083, // WebSocket port
    clientId: `chilihub_mobile_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`,
};

// Topics
export const MQTT_TOPICS = {
    SENSOR_DATA: 'chilihub/data/sensors',
    PREDICTION: 'chilihub/predictions/class',
};

interface MqttContextType {
    isConnected: boolean;
    sensorData: SensorData | null;
    prediction: PredictionResult | null;
    lastUpdate: Date | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    error: string | null;
    sensorHistory: SensorHistoryPoint[];
}

// For chart visualization - store last 10 data points
interface SensorHistoryPoint {
    timestamp: string;
    temp: number;
    rh_air: number;
    rh_soil: number;
    lux: number;
}

const MAX_HISTORY_POINTS = 10;

const defaultSensorData: SensorData = {
    temp: 0,
    rh_air: 0,
    rh_soil: 0,
    lux: 0,
    sensor_health: {
        dht_ok: false,
        photo_ok: false,
        soil_ok: false,
    },
};

const defaultPrediction: PredictionResult = {
    status: 'NORMAL',
    code: 0,
    timestamp: '',
    sensors_ok: false,
};

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [sensorHistory, setSensorHistory] = useState<SensorHistoryPoint[]>([]);

    // Connect to MQTT via WebSocket
    const connect = useCallback(async () => {
        try {
            setError(null);
            console.log('[MQTT] Connecting to broker...');

            // Create WebSocket connection to EMQX
            const wsUrl = `ws://${MQTT_CONFIG.broker}:${MQTT_CONFIG.wsPort}/mqtt`;
            const socket = new WebSocket(wsUrl, 'mqtt');

            socket.binaryType = 'arraybuffer';

            socket.onopen = () => {
                console.log('[MQTT] WebSocket connected');

                // Send MQTT CONNECT packet
                const connectPacket = createConnectPacket(MQTT_CONFIG.clientId);
                socket.send(connectPacket);
            };

            socket.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                handleMqttPacket(data, socket);
            };

            socket.onerror = (err) => {
                console.error('[MQTT] WebSocket error:', err);
                setError('Connection error');
                setIsConnected(false);
            };

            socket.onclose = () => {
                console.log('[MQTT] WebSocket closed');
                setIsConnected(false);
            };

            setWs(socket);
        } catch (err) {
            console.error('[MQTT] Connection error:', err);
            setError('Failed to connect');
        }
    }, []);

    // Handle incoming MQTT packets
    const handleMqttPacket = (data: Uint8Array, socket: WebSocket) => {
        const packetType = (data[0] >> 4) & 0x0F;

        switch (packetType) {
            case 2: // CONNACK
                console.log('[MQTT] Connected to broker');
                setIsConnected(true);
                setError(null);

                // Subscribe to topics
                subscribeToTopics(socket);
                break;

            case 3: // PUBLISH
                handlePublishPacket(data);
                break;

            case 9: // SUBACK
                console.log('[MQTT] Subscribed successfully');
                break;
        }
    };

    // Create MQTT CONNECT packet
    const createConnectPacket = (clientId: string): ArrayBuffer => {
        const protocolName = 'MQTT';
        const protocolLevel = 4; // MQTT 3.1.1
        const connectFlags = 2; // Clean session
        const keepAlive = 60;

        const variableHeader = [
            0, protocolName.length,
            ...Array.from(protocolName).map(c => c.charCodeAt(0)),
            protocolLevel,
            connectFlags,
            keepAlive >> 8, keepAlive & 0xFF
        ];

        const payload = [
            0, clientId.length,
            ...Array.from(clientId).map(c => c.charCodeAt(0))
        ];

        const remainingLength = variableHeader.length + payload.length;
        const fixedHeader = [0x10, remainingLength]; // CONNECT packet

        return new Uint8Array([...fixedHeader, ...variableHeader, ...payload]).buffer;
    };

    // Subscribe to topics
    const subscribeToTopics = (socket: WebSocket) => {
        // Subscribe to sensor data topic
        const sensorSubscribe = createSubscribePacket(MQTT_TOPICS.SENSOR_DATA, 1);
        socket.send(sensorSubscribe);

        // Subscribe to prediction topic
        const predictionSubscribe = createSubscribePacket(MQTT_TOPICS.PREDICTION, 2);
        socket.send(predictionSubscribe);

        console.log('[MQTT] Subscribed to topics');
    };

    // Create MQTT SUBSCRIBE packet
    const createSubscribePacket = (topic: string, packetId: number): ArrayBuffer => {
        const topicBytes = [
            0, topic.length,
            ...Array.from(topic).map(c => c.charCodeAt(0)),
            0 // QoS 0
        ];

        const variableHeader = [packetId >> 8, packetId & 0xFF];
        const remainingLength = variableHeader.length + topicBytes.length;
        const fixedHeader = [0x82, remainingLength]; // SUBSCRIBE packet

        return new Uint8Array([...fixedHeader, ...variableHeader, ...topicBytes]).buffer;
    };

    // Handle PUBLISH packet
    const handlePublishPacket = (data: Uint8Array) => {
        try {
            let offset = 1;

            // Parse remaining length (can be 1-4 bytes)
            let remainingLength = 0;
            let multiplier = 1;
            let encodedByte;
            do {
                encodedByte = data[offset++];
                remainingLength += (encodedByte & 0x7F) * multiplier;
                multiplier *= 128;
            } while ((encodedByte & 0x80) !== 0);

            // Parse topic length (2 bytes)
            const topicLength = (data[offset] << 8) | data[offset + 1];
            offset += 2;

            // Extract topic
            const topicBytes = data.slice(offset, offset + topicLength);
            const topic = String.fromCharCode(...topicBytes);
            offset += topicLength;

            // Extract payload (rest of the data)
            const payloadBytes = data.slice(offset);

            // Convert payload bytes to string, handling UTF-8
            let payload = '';
            try {
                // Try using TextDecoder for proper UTF-8 handling
                const decoder = new TextDecoder('utf-8');
                payload = decoder.decode(payloadBytes);
            } catch {
                // Fallback to basic conversion
                payload = String.fromCharCode(...payloadBytes);
            }

            console.log(`[MQTT] Received on ${topic}:`, payload);

            // Parse JSON payload
            const jsonData = JSON.parse(payload);

            if (topic === MQTT_TOPICS.SENSOR_DATA) {
                const newSensorData: SensorData = {
                    temp: jsonData.temp || 0,
                    rh_air: jsonData.rh_air || 0,
                    rh_soil: jsonData.rh_soil || 0,
                    lux: jsonData.lux || 0,
                    sensor_health: {
                        dht_ok: jsonData.sensor_health?.dht_ok ?? true,
                        photo_ok: jsonData.sensor_health?.photo_ok ?? true,
                        soil_ok: jsonData.sensor_health?.soil_ok ?? true,
                    },
                };
                console.log('[MQTT] Sensor data updated:', newSensorData);
                setSensorData(newSensorData);
                setLastUpdate(new Date());

                // Add to history for chart visualization
                const now = new Date();
                const historyPoint: SensorHistoryPoint = {
                    timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                    temp: newSensorData.temp,
                    rh_air: newSensorData.rh_air,
                    rh_soil: newSensorData.rh_soil,
                    lux: newSensorData.lux,
                };
                setSensorHistory(prev => {
                    const newHistory = [...prev, historyPoint];
                    // Keep only last MAX_HISTORY_POINTS
                    if (newHistory.length > MAX_HISTORY_POINTS) {
                        return newHistory.slice(-MAX_HISTORY_POINTS);
                    }
                    return newHistory;
                });
            }

            if (topic === MQTT_TOPICS.PREDICTION) {
                const newPrediction: PredictionResult = {
                    status: jsonData.status || 'NORMAL',
                    code: jsonData.code ?? 0,
                    timestamp: jsonData.timestamp || new Date().toLocaleTimeString(),
                    sensors_ok: jsonData.sensors_ok ?? true,
                };
                console.log('[MQTT] Prediction updated:', newPrediction);
                setPrediction(newPrediction);
                setLastUpdate(new Date());
            }
        } catch (err) {
            console.error('[MQTT] Parse error:', err);
        }
    };

    // Disconnect from broker
    const disconnect = useCallback(() => {
        if (ws) {
            // Send DISCONNECT packet
            const disconnectPacket = new Uint8Array([0xE0, 0x00]);
            ws.send(disconnectPacket.buffer);
            ws.close();
            setWs(null);
        }
        setIsConnected(false);
    }, [ws]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [ws]);

    return (
        <MqttContext.Provider
            value={{
                isConnected,
                sensorData,
                prediction,
                lastUpdate,
                connect,
                disconnect,
                error,
                sensorHistory,
            }}
        >
            {children}
        </MqttContext.Provider>
    );
};

export const useMqtt = (): MqttContextType => {
    const context = useContext(MqttContext);
    if (context === undefined) {
        throw new Error('useMqtt must be used within a MqttProvider');
    }
    return context;
};

export default MqttContext;
