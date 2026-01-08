// ChiliHub TypeScript Type Definitions

// ================================
// MQTT & Sensor Types
// ================================

export interface SensorData {
    temp: number;          // Temperature in Celsius
    rh_air: number;        // Air humidity percentage
    rh_soil: number;       // Soil moisture percentage
    lux: number;           // Light intensity in lux
    sensor_health: SensorHealth;
}

export interface SensorHealth {
    dht_ok: boolean;       // DHT22 sensor status
    photo_ok: boolean;     // Photoresistor status
    soil_ok: boolean;      // Soil moisture sensor status
}

export interface PredictionResult {
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    code: 0 | 1 | 2;       // 0=NORMAL, 1=WARNING, 2=CRITICAL
    timestamp: string;
    sensors_ok: boolean;
}

// ================================
// Device Types
// ================================

export type DeviceStatus = 'active' | 'standby' | 'inactive';

export interface Device {
    id: string;
    name: string;
    location: string;
    status: DeviceStatus;
    batteryLevel?: number;
    lastUpdate?: string;
    sensorData?: SensorData;
    prediction?: PredictionResult;
}

// ================================
// User & Auth Types
// ================================

export interface User {
    id: string;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    location?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
}

export interface LoginCredentials {
    identifier: string;  // Can be email or username
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// ================================
// Weather Types
// ================================

export interface WeatherData {
    temperature: number;
    location: string;
    condition: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
    hourlyForecast: HourlyForecast[];
}

export interface HourlyForecast {
    time: string;
    temperature: number;
}

// ================================
// Navigation Types
// ================================

export type RootStackParamList = {
    '(auth)': undefined;
    '(main)': undefined;
};

export type AuthStackParamList = {
    login: undefined;
    register: undefined;
    forgotPassword: undefined;
};

export type MainStackParamList = {
    '(tabs)': undefined;
    deviceDetail: { id: string };
    settings: undefined;
};

export type TabParamList = {
    beranda: undefined;
    device: undefined;
    profile: undefined;
};
