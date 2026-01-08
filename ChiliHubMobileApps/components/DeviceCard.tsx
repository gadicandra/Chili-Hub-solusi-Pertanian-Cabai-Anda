import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Device, DeviceStatus } from '../types/types';

interface DeviceCardProps {
    device: Device;
    onPress?: () => void;
    style?: ViewStyle;
    showBattery?: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    device,
    onPress,
    style,
    showBattery = true,
}) => {
    const getStatusConfig = (status: DeviceStatus) => {
        switch (status) {
            case 'active':
                return { color: Colors.deviceActive, label: 'Aktif' };
            case 'standby':
                return { color: Colors.deviceStandby, label: 'Standby' };
            case 'inactive':
                return { color: Colors.deviceInactive, label: 'Non-aktif' };
        }
    };

    const statusConfig = getStatusConfig(device.status);

    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="leaf" size={24} color={Colors.primary} />
                </View>

                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {device.name}
                    </Text>
                    <Text style={styles.location} numberOfLines={1}>
                        {device.location || 'Ketuk untuk melihat detail'}
                    </Text>
                </View>

                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                    {showBattery && device.batteryLevel !== undefined && (
                        <View style={styles.batteryContainer}>
                            <Ionicons
                                name={device.batteryLevel > 20 ? 'battery-half' : 'battery-dead'}
                                size={16}
                                color={device.batteryLevel > 20 ? Colors.textMuted : Colors.critical}
                            />
                            <Text style={styles.batteryText}>{device.batteryLevel}%</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: Colors.textMuted,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginBottom: 8,
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    batteryText: {
        fontSize: 12,
        color: Colors.textMuted,
        marginLeft: 4,
    },
});

export default DeviceCard;
