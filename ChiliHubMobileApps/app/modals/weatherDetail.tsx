import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

// Extended weather data
const WEATHER_DATA = {
    current: {
        temperature: 24,
        condition: 'Cerah',
        humidity: 78,
        windSpeed: 12,
        uvIndex: 6,
        visibility: 10,
    },
    hourly: [
        { time: '15:00', temp: 24, icon: 'sunny' },
        { time: '16:00', temp: 22, icon: 'sunny' },
        { time: '17:00', temp: 23, icon: 'partly-sunny' },
        { time: '18:00', temp: 27, icon: 'cloudy' },
        { time: '19:00', temp: 21, icon: 'cloudy' },
        { time: '20:00', temp: 20, icon: 'moon' },
        { time: '21:00', temp: 19, icon: 'moon' },
    ],
    daily: [
        { day: 'Hari ini', high: 28, low: 20, icon: 'sunny' },
        { day: 'Besok', high: 27, low: 19, icon: 'partly-sunny' },
        { day: 'Sabtu', high: 25, low: 18, icon: 'rainy' },
        { day: 'Minggu', high: 26, low: 19, icon: 'cloudy' },
        { day: 'Senin', high: 28, low: 20, icon: 'sunny' },
    ],
};

export default function WeatherDetailModal() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Cuaca</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Weather */}
                <View style={styles.currentSection}>
                    <View style={styles.currentMain}>
                        <Ionicons name="sunny" size={64} color="#FFD700" />
                        <Text style={styles.currentTemp}>{WEATHER_DATA.current.temperature}°</Text>
                    </View>
                    <Text style={styles.currentCondition}>{WEATHER_DATA.current.condition}</Text>
                    <Text style={styles.location}>Grendeng, Purwokerto</Text>
                </View>

                {/* Weather Details */}
                <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                        <Ionicons name="water" size={24} color={Colors.primary} />
                        <Text style={styles.detailValue}>{WEATHER_DATA.current.humidity}%</Text>
                        <Text style={styles.detailLabel}>Kelembapan</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="speedometer" size={24} color={Colors.primary} />
                        <Text style={styles.detailValue}>{WEATHER_DATA.current.windSpeed} km/h</Text>
                        <Text style={styles.detailLabel}>Angin</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="sunny" size={24} color={Colors.warning} />
                        <Text style={styles.detailValue}>{WEATHER_DATA.current.uvIndex}</Text>
                        <Text style={styles.detailLabel}>UV Index</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="eye" size={24} color={Colors.primary} />
                        <Text style={styles.detailValue}>{WEATHER_DATA.current.visibility} km</Text>
                        <Text style={styles.detailLabel}>Jarak Pandang</Text>
                    </View>
                </View>

                {/* Hourly Forecast */}
                <Text style={styles.sectionTitle}>Prakiraan Per Jam</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.hourlyScroll}
                >
                    {WEATHER_DATA.hourly.map((item, index) => (
                        <View key={index} style={styles.hourlyItem}>
                            <Text style={styles.hourlyTime}>{item.time}</Text>
                            <Ionicons
                                name={item.icon as keyof typeof Ionicons.glyphMap}
                                size={24}
                                color={item.icon === 'sunny' ? '#FFD700' : Colors.textSecondary}
                            />
                            <Text style={styles.hourlyTemp}>{item.temp}°</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Daily Forecast */}
                <Text style={styles.sectionTitle}>Prakiraan 5 Hari</Text>
                <View style={styles.dailyList}>
                    {WEATHER_DATA.daily.map((item, index) => (
                        <View key={index} style={styles.dailyItem}>
                            <Text style={styles.dailyDay}>{item.day}</Text>
                            <Ionicons
                                name={item.icon as keyof typeof Ionicons.glyphMap}
                                size={24}
                                color={item.icon === 'sunny' ? '#FFD700' : Colors.textSecondary}
                            />
                            <View style={styles.dailyTemps}>
                                <Text style={styles.dailyHigh}>{item.high}°</Text>
                                <Text style={styles.dailyLow}>{item.low}°</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Farming Tips */}
                <Text style={styles.sectionTitle}>Tips Pertanian</Text>
                <View style={styles.tipCard}>
                    <Ionicons name="bulb" size={24} color={Colors.warning} />
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Kondisi Ideal untuk Cabai</Text>
                        <Text style={styles.tipText}>
                            Cuaca cerah dengan suhu 24°C sangat ideal untuk pertumbuhan cabai.
                            Pastikan penyiraman dilakukan pagi hari untuk hasil optimal.
                        </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 16,
    },
    currentSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: Colors.surface,
        borderRadius: 24,
        marginBottom: 16,
    },
    currentMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    currentTemp: {
        fontSize: 72,
        fontWeight: '200',
        color: Colors.textPrimary,
        marginLeft: 16,
    },
    currentCondition: {
        fontSize: 20,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    location: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    detailItem: {
        width: '48%',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 8,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    hourlyScroll: {
        marginBottom: 24,
    },
    hourlyItem: {
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        minWidth: 70,
    },
    hourlyTime: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    hourlyTemp: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginTop: 8,
    },
    dailyList: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: 24,
    },
    dailyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    dailyDay: {
        flex: 1,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    dailyTemps: {
        flexDirection: 'row',
        gap: 16,
    },
    dailyHigh: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    dailyLow: {
        fontSize: 16,
        color: Colors.textMuted,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: Colors.statusWarningBg,
        borderRadius: 16,
        padding: 16,
    },
    tipContent: {
        flex: 1,
        marginLeft: 12,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    tipText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
});
