import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/colors';

interface SensorCardProps {
    title: string;
    value: string | number;
    unit: string;
    subtitle?: string;
    status?: 'normal' | 'warning' | 'critical';
    backgroundColor?: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export const SensorCard: React.FC<SensorCardProps> = ({
    title,
    value,
    unit,
    subtitle,
    status,
    backgroundColor = Colors.primary,
    icon,
    style,
}) => {
    const getStatusLabel = () => {
        switch (status) {
            case 'normal':
                return { text: 'Optimal', color: Colors.normal, bgColor: Colors.statusNormalBg };
            case 'warning':
                return { text: 'Warning', color: Colors.warning, bgColor: Colors.statusWarningBg };
            case 'critical':
                return { text: 'Critical', color: Colors.critical, bgColor: Colors.statusCriticalBg };
            default:
                return null;
        }
    };

    const statusInfo = getStatusLabel();

    return (
        <View style={[styles.card, { backgroundColor }, style]}>
            <View style={styles.header}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.valueContainer}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>

            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {statusInfo && (
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                        {statusInfo.text}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        minWidth: 140,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textWhite,
        opacity: 0.9,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    value: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.textWhite,
    },
    unit: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textWhite,
        opacity: 0.8,
        marginLeft: 4,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textWhite,
        opacity: 0.7,
        marginTop: 4,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default SensorCard;
