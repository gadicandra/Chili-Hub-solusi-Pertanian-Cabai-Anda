import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import Card from './Card';

interface HourlyForecast {
    time: string;
    temperature: number;
}

interface WeatherWidgetProps {
    temperature: number;
    location: string;
    condition?: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy';
    hourlyForecast?: HourlyForecast[];
    style?: ViewStyle;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
    temperature,
    location,
    condition = 'sunny',
    hourlyForecast = [],
    style,
}) => {
    const getWeatherIcon = () => {
        switch (condition) {
            case 'sunny':
                return 'sunny';
            case 'cloudy':
                return 'cloudy';
            case 'rainy':
                return 'rainy';
            case 'partly_cloudy':
                return 'partly-sunny';
            default:
                return 'sunny';
        }
    };

    const containerStyle: ViewStyle = {
        ...styles.container,
        ...style,
    };

    return (
        <Card style={containerStyle} padding={20}>
            <View style={styles.mainContent}>
                <View style={styles.temperatureSection}>
                    <Text style={styles.temperature}>{temperature}°C</Text>
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color={Colors.textSecondary} />
                        <Text style={styles.location}>{location}</Text>
                    </View>
                </View>

                <View style={styles.iconSection}>
                    <Ionicons
                        name={getWeatherIcon()}
                        size={48}
                        color={condition === 'sunny' ? '#FFD700' : Colors.textSecondary}
                    />
                </View>
            </View>

            {hourlyForecast.length > 0 && (
                <View style={styles.forecastSection}>
                    {hourlyForecast.map((item, index) => (
                        <View key={index} style={styles.forecastItem}>
                            <Text style={styles.forecastTemp}>{item.temperature}°C</Text>
                            <Text style={styles.forecastTime}>{item.time}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    temperatureSection: {
        flex: 1,
    },
    temperature: {
        fontSize: 48,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    location: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    iconSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    forecastSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    forecastItem: {
        alignItems: 'center',
    },
    forecastTemp: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    forecastTime: {
        fontSize: 12,
        color: Colors.textMuted,
    },
});

export default WeatherWidget;
