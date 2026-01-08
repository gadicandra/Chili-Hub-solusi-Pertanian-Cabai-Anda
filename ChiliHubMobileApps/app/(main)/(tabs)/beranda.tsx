import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';
import WeatherWidget from '../../../components/WeatherWidget';
import DeviceCard from '../../../components/DeviceCard';
import { Device } from '../../../types/types';

// Dummy data untuk devices
const DUMMY_DEVICES: Device[] = [
    {
        id: '1',
        name: 'Kebun Cabe 1',
        location: 'Belakang rumah',
        status: 'active',
        batteryLevel: 92,
    },
];

// Dummy weather data
const DUMMY_WEATHER = {
    temperature: 24,
    location: 'Sleman, Yogyakarta',
    condition: 'sunny' as const,
    hourlyForecast: [
        { time: '15:00', temperature: 24 },
        { time: '16:00', temperature: 22 },
        { time: '17:00', temperature: 23 },
        { time: '18:00', temperature: 27 },
        { time: '19:00', temperature: 21 },
    ],
};

export default function BerandaScreen() {
    const { user } = useAuth();

    const handleDevicePress = (device: Device) => {
        router.push(`/(main)/deviceDetail/${device.id}`);
    };

    const handleViewAllDevices = () => {
        router.push('/(main)/(tabs)/device');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Selamat datang</Text>
                        <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Weather Widget */}
                <WeatherWidget
                    temperature={DUMMY_WEATHER.temperature}
                    location={DUMMY_WEATHER.location}
                    condition={DUMMY_WEATHER.condition}
                    hourlyForecast={DUMMY_WEATHER.hourlyForecast}
                    style={styles.weatherWidget}
                />

                {/* Device Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Device</Text>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={handleViewAllDevices}
                    >
                        <Text style={styles.viewAllText}>Lihat semua</Text>
                    </TouchableOpacity>
                </View>

                {/* Device List */}
                <View style={styles.deviceList}>
                    {DUMMY_DEVICES.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onPress={() => handleDevicePress(device)}
                            style={styles.deviceCard}
                        />
                    ))}
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStats}>
                    <View style={styles.statCard}>
                        <Ionicons name="wifi" size={24} color={Colors.primary} />
                        <Text style={styles.statValue}>Online</Text>
                        <Text style={styles.statLabel}>Status</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="battery-half" size={24} color={Colors.normal} />
                        <Text style={styles.statValue}>92%</Text>
                        <Text style={styles.statLabel}>Baterai</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="leaf" size={24} color={Colors.primary} />
                        <Text style={styles.statValue}>1</Text>
                        <Text style={styles.statLabel}>Device</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    notificationButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherWidget: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    viewAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: Colors.green_apple,
    },
    viewAllText: {
        fontSize: 12,
        color: Colors.white,
    },
    deviceList: {
        gap: 12,
        marginBottom: 24,
    },
    deviceCard: {
        marginBottom: 12,
    },
    quickStats: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
});
