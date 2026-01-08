import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';
import { Device, DeviceStatus } from '../../../types/types';

// Dummy devices
const DUMMY_DEVICES: Device[] = [
    {
        id: '1',
        name: 'Kebun Cabe 1',
        location: 'Belakang rumah',
        status: 'active',
    },
];

const StatusLegend: React.FC<{ status: DeviceStatus; label: string }> = ({ status, label }) => {
    const getColor = () => {
        switch (status) {
            case 'active': return Colors.deviceActive;
            case 'standby': return Colors.deviceStandby;
            case 'inactive': return Colors.deviceInactive;
        }
    };

    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: getColor() }]} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
};

const DeviceListItem: React.FC<{ device: Device; onPress: () => void }> = ({ device, onPress }) => {
    const getStatusColor = () => {
        switch (device.status) {
            case 'active': return Colors.deviceActive;
            case 'standby': return Colors.deviceStandby;
            case 'inactive': return Colors.deviceInactive;
        }
    };

    return (
        <TouchableOpacity style={styles.deviceItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.deviceIcon}>
                <Ionicons name="leaf" size={24} color={Colors.primary} />
            </View>
            <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceLocation}>{device.location}</Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        </TouchableOpacity>
    );
};

export default function DeviceScreen() {
    const handleDevicePress = (device: Device) => {
        router.push(`/ (main) / deviceDetail / ${device.id} `);
    };

    const handleGetDevice = () => {
        // Navigate to store or show info
    };

    const handleAddDevice = () => {
        // Show add device modal
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroContent}>
                        <View style={styles.heroLogo}>
                            <Ionicons name="leaf" size={32} color={Colors.primary} />
                            <Text style={styles.heroLogoText}>Perangkat</Text>
                        </View>

                        <Text style={styles.heroTitle}>Solusi Cerdas untuk{'\n'}Pertanian Modern</Text>
                        <Text style={styles.heroSubtitle}>Pantau kebun, tingkatkan hasil!</Text>

                        <View style={styles.heroButtons}>
                            <TouchableOpacity style={styles.getDeviceButton}>
                                <Text style={styles.getDeviceText}>Dapatkan device</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buyButton}>
                                <Text style={styles.buyButtonText}>Dapatkan 🌶️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.heroImage}>
                        <View style={styles.deviceImage}>
                            <Ionicons name="hardware-chip" size={64} color={Colors.textMuted} />
                        </View>
                    </View>
                </View>

                {/* Device Section */}
                <View style={styles.deviceSection}>
                    <Text style={styles.sectionTitle}>Device kamu</Text>

                    {/* Status Legend */}
                    <View style={styles.legend}>
                        <StatusLegend status="active" label="Aktif" />
                        <StatusLegend status="standby" label="Standby" />
                        <StatusLegend status="inactive" label="Non-aktif" />
                    </View>

                    {/* Device List */}
                    <View style={styles.deviceList}>
                        {DUMMY_DEVICES.map((device) => (
                            <DeviceListItem
                                key={device.id}
                                device={device}
                                onPress={() => handleDevicePress(device)}
                            />
                        ))}
                    </View>

                    {/* Add Device Button */}
                    <TouchableOpacity style={styles.addDeviceButton} onPress={handleAddDevice}>
                        <View style={styles.addIcon}>
                            <Ionicons name="add" size={24} color={Colors.textMuted} />
                        </View>
                        <Text style={styles.addDeviceText}>Tambah device atau perangkat</Text>
                    </TouchableOpacity>
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
        paddingBottom: 24,
    },
    // Hero Section
    heroSection: {
        backgroundColor: Colors.surface,
        padding: 24,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    heroContent: {
        flex: 1,
    },
    heroLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    heroLogoText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: 8,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        lineHeight: 24,
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    heroButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    getDeviceButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: Colors.background,
    },
    getDeviceText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    buyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: Colors.primary,
    },
    buyButtonText: {
        fontSize: 12,
        color: Colors.textWhite,
        fontWeight: '600',
    },
    heroImage: {
        marginLeft: 16,
    },
    deviceImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Device Section
    deviceSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    legend: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    deviceList: {
        gap: 12,
    },
    deviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
    },
    deviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    deviceLocation: {
        fontSize: 14,
        color: Colors.textMuted,
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    addDeviceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    addIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    addDeviceText: {
        fontSize: 14,
        color: Colors.textMuted,
    },
});
