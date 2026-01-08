import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Colors from '../../constants/colors';

const screenWidth = Dimensions.get('window').width;

// Dummy historical data
const SENSOR_OPTIONS = [
    { id: 'temp', label: 'Suhu', unit: '°C', color: Colors.sensorTemp },
    { id: 'humidity', label: 'Kelembapan', unit: '%', color: Colors.sensorHumidity },
    { id: 'light', label: 'Cahaya', unit: 'lux', color: Colors.sensorLight },
    { id: 'soil', label: 'Kelembapan Tanah', unit: '%', color: Colors.sensorSoil },
];

const DUMMY_DATA: Record<string, number[]> = {
    temp: [28, 29, 30, 28, 27, 26, 28, 29, 30, 28, 27, 28],
    humidity: [70, 72, 75, 74, 73, 71, 70, 72, 74, 75, 73, 72],
    light: [500, 1000, 3000, 5000, 8000, 8500, 7000, 5000, 3000, 1000, 500, 200],
    soil: [35, 34, 33, 32, 31, 30, 35, 40, 38, 36, 35, 34],
};

const TIME_LABELS = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export default function SensorVisualizationModal() {
    const [selectedSensor, setSelectedSensor] = useState('temp');

    const currentSensor = SENSOR_OPTIONS.find(s => s.id === selectedSensor)!;
    const chartData = DUMMY_DATA[selectedSensor];

    const getStats = () => {
        const data = chartData;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        return { min, max, avg: avg.toFixed(1) };
    };

    const stats = getStats();

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
                <Text style={styles.headerTitle}>Visualisasi Sensor</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Sensor Selector */}
            <View style={styles.sensorSelector}>
                {SENSOR_OPTIONS.map((sensor) => (
                    <TouchableOpacity
                        key={sensor.id}
                        style={[
                            styles.sensorTab,
                            selectedSensor === sensor.id && { backgroundColor: sensor.color },
                        ]}
                        onPress={() => setSelectedSensor(sensor.id)}
                    >
                        <Text
                            style={[
                                styles.sensorTabText,
                                selectedSensor === sensor.id && styles.sensorTabTextActive,
                            ]}
                        >
                            {sensor.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>{currentSensor.label} (24 Jam Terakhir)</Text>
                <LineChart
                    data={{
                        labels: TIME_LABELS.filter((_, i) => i % 2 === 0),
                        datasets: [{ data: chartData }],
                    }}
                    width={screenWidth - 32}
                    height={220}
                    yAxisSuffix={currentSensor.unit}
                    chartConfig={{
                        backgroundColor: Colors.surface,
                        backgroundGradientFrom: Colors.surface,
                        backgroundGradientTo: Colors.surface,
                        decimalPlaces: 0,
                        color: (opacity = 1) => currentSensor.color,
                        labelColor: (opacity = 1) => Colors.textSecondary,
                        style: { borderRadius: 16 },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: currentSensor.color,
                        },
                    }}
                    bezier
                    style={styles.chart}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Ionicons name="arrow-down" size={20} color={Colors.primary} />
                    <Text style={styles.statValue}>{stats.min}{currentSensor.unit}</Text>
                    <Text style={styles.statLabel}>Minimum</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="analytics" size={20} color={Colors.warning} />
                    <Text style={styles.statValue}>{stats.avg}{currentSensor.unit}</Text>
                    <Text style={styles.statLabel}>Rata-rata</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons name="arrow-up" size={20} color={Colors.critical} />
                    <Text style={styles.statValue}>{stats.max}{currentSensor.unit}</Text>
                    <Text style={styles.statLabel}>Maximum</Text>
                </View>
            </View>

            {/* Current Value */}
            <View style={styles.currentValue}>
                <Text style={styles.currentLabel}>Nilai Saat Ini</Text>
                <Text style={[styles.currentNumber, { color: currentSensor.color }]}>
                    {chartData[chartData.length - 1]}{currentSensor.unit}
                </Text>
            </View>
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
    sensorSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    sensorTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: 'center',
    },
    sensorTabText: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    sensorTabTextActive: {
        color: Colors.textWhite,
    },
    chartContainer: {
        padding: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
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
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    currentValue: {
        margin: 16,
        padding: 24,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        alignItems: 'center',
    },
    currentLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    currentNumber: {
        fontSize: 48,
        fontWeight: '700',
    },
});
