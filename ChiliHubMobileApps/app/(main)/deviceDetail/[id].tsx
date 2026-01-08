import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Colors from '../../../constants/colors';
import SensorCard from '../../../components/SensorCard';
import { useMqtt } from '../../../contexts/MqttContext';

const screenWidth = Dimensions.get('window').width;

// Device names mapping
const DEVICE_NAMES: Record<string, string> = {
    '1': 'Kebun Cabe 1',
    '2': 'Kebun Cabe 2',
    '3': 'Kebun Cabe 3',
};

export default function DeviceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const {
        isConnected,
        sensorData,
        prediction,
        lastUpdate,
        connect,
        error,
        sensorHistory,
    } = useMqtt();
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedChart, setSelectedChart] = React.useState<'temp' | 'humidity' | 'lux'>('temp');

    const deviceName = DEVICE_NAMES[id || '1'] || 'Device';

    // Connect to MQTT on mount
    useEffect(() => {
        if (!isConnected) {
            connect();
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        if (!isConnected) {
            await connect();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NORMAL': return Colors.normal;
            case 'WARNING': return Colors.warning;
            case 'CRITICAL': return Colors.critical;
            default: return Colors.textMuted;
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'NORMAL': return Colors.statusNormalBg;
            case 'WARNING': return Colors.statusWarningBg;
            case 'CRITICAL': return Colors.statusCriticalBg;
            default: return Colors.surface;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'NORMAL': return 'Normal';
            case 'WARNING': return 'Perhatian';
            case 'CRITICAL': return 'Kritis';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NORMAL': return 'checkmark-circle';
            case 'WARNING': return 'warning';
            case 'CRITICAL': return 'alert-circle';
            default: return 'help-circle';
        }
    };

    // Determine soil status based on value
    const getSoilStatus = (value: number): 'normal' | 'warning' | 'critical' => {
        if (value >= 20 && value <= 60) return 'normal';
        if (value > 60 || (value < 20 && value >= 10)) return 'warning';
        return 'critical';
    };

    // Determine temperature status
    const getTempStatus = (value: number): 'normal' | 'warning' | 'critical' => {
        if (value >= 15 && value <= 30) return 'normal';
        if ((value > 30 && value <= 35) || (value >= 10 && value < 15)) return 'warning';
        return 'critical';
    };

    // Format last update time
    const getLastUpdateText = () => {
        if (!lastUpdate) return 'Menunggu data...';
        return lastUpdate.toLocaleTimeString('id-ID');
    };

    // Default sensor data with 0 values if no MQTT data
    const displaySensorData = sensorData || {
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

    // Current prediction status or default
    const currentStatus = prediction?.status || 'NORMAL';
    const predictionCode = prediction?.code ?? 0;
    const timestamp = prediction?.timestamp || getLastUpdateText();

    // Chart data
    const getChartData = () => {
        const labels = sensorHistory.length > 0
            ? sensorHistory.map(h => h.timestamp)
            : ['--'];

        let data: number[] = [0];
        let color = Colors.primary;

        if (sensorHistory.length > 0) {
            switch (selectedChart) {
                case 'temp':
                    data = sensorHistory.map(h => h.temp);
                    color = '#FF6B6B';
                    break;
                case 'humidity':
                    data = sensorHistory.map(h => h.rh_air);
                    color = '#4ECDC4';
                    break;
                case 'lux':
                    data = sensorHistory.map(h => h.lux / 1000); // Scale down for display
                    color = '#FFE66D';
                    break;
            }
        }

        return {
            labels,
            datasets: [{ data, color: () => color, strokeWidth: 2 }],
        };
    };

    const chartConfig = {
        backgroundColor: Colors.surface,
        backgroundGradientFrom: Colors.surface,
        backgroundGradientTo: Colors.surface,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        labelColor: () => Colors.textSecondary,
        style: { borderRadius: 16 },
        propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{deviceName}</Text>
                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="create-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Connection Status */}
                <TouchableOpacity
                    style={[
                        styles.connectionBanner,
                        { backgroundColor: isConnected ? Colors.statusNormalBg : Colors.statusCriticalBg }
                    ]}
                    onPress={() => !isConnected && connect()}
                >
                    <View style={styles.connectionDot}>
                        <View style={[
                            styles.dot,
                            { backgroundColor: isConnected ? Colors.normal : Colors.critical }
                        ]} />
                    </View>
                    <Text style={styles.connectionText}>
                        MQTT: {isConnected ? 'Terhubung' : 'Terputus'}
                    </Text>
                    {!isConnected && (
                        <Text style={styles.reconnectText}>Ketuk untuk menghubungkan</Text>
                    )}
                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                </TouchableOpacity>

                {/* Prediction Status Card */}
                <View style={[styles.predictionCard, { backgroundColor: getStatusBgColor(currentStatus) }]}>
                    <View style={styles.predictionHeader}>
                        <Ionicons
                            name={getStatusIcon(currentStatus)}
                            size={48}
                            color={getStatusColor(currentStatus)}
                        />
                        <View style={styles.predictionInfo}>
                            <Text style={styles.predictionLabel}>Hasil Prediksi ML</Text>
                            <Text style={[styles.predictionStatus, { color: getStatusColor(currentStatus) }]}>
                                {getStatusText(currentStatus)}
                            </Text>
                        </View>
                        <View style={[styles.predictionBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
                            <Text style={styles.predictionCode}>Code: {predictionCode}</Text>
                        </View>
                    </View>
                    <View style={styles.predictionMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                            <Text style={styles.metaText}>Update: {timestamp}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons
                                name={prediction?.sensors_ok ? "checkmark-circle" : "close-circle"}
                                size={14}
                                color={prediction?.sensors_ok ? Colors.normal : Colors.critical}
                            />
                            <Text style={styles.metaText}>
                                Sensor: {prediction?.sensors_ok ? 'OK' : 'Error'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Main Sensor Cards */}
                <Text style={styles.sectionTitle}>Data Sensor Real-time</Text>
                <View style={styles.sensorRow}>
                    <SensorCard
                        title="Suhu"
                        value={displaySensorData.temp.toFixed(1)}
                        unit="°C"
                        subtitle={`Normal 15°C - 30°C`}
                        status={getTempStatus(displaySensorData.temp)}
                        backgroundColor={Colors.sensorTemp}
                        style={styles.sensorCardHalf}
                    />
                    <SensorCard
                        title="Kel. Tanah"
                        value={displaySensorData.rh_soil}
                        unit="%"
                        subtitle="Lembab 20% - 60%"
                        status={getSoilStatus(displaySensorData.rh_soil)}
                        backgroundColor={Colors.sensorHumidity}
                        style={styles.sensorCardHalf}
                    />
                </View>

                <View style={styles.sensorRow}>
                    <SensorCard
                        title="Kel. Udara"
                        value={displaySensorData.rh_air.toFixed(1)}
                        unit="%"
                        subtitle="Kelembapan udara"
                        backgroundColor={Colors.sensorTemp}
                        style={styles.sensorCardHalf}
                    />
                    <SensorCard
                        title="Cahaya"
                        value={displaySensorData.lux >= 1000
                            ? `${(displaySensorData.lux / 1000).toFixed(1)}k`
                            : displaySensorData.lux.toFixed(0)}
                        unit="lux"
                        subtitle="Intensitas cahaya"
                        backgroundColor={Colors.sensorHumidity}
                        style={styles.sensorCardHalf}
                    />
                </View>

                {/* Chart Section */}
                <Text style={styles.sectionTitle}>Grafik Sensor</Text>

                {/* Chart Type Selector */}
                <View style={styles.chartSelector}>
                    <TouchableOpacity
                        style={[styles.chartTab, selectedChart === 'temp' && styles.chartTabActive]}
                        onPress={() => setSelectedChart('temp')}
                    >
                        <Text style={[styles.chartTabText, selectedChart === 'temp' && styles.chartTabTextActive]}>
                            Suhu
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chartTab, selectedChart === 'humidity' && styles.chartTabActive]}
                        onPress={() => setSelectedChart('humidity')}
                    >
                        <Text style={[styles.chartTabText, selectedChart === 'humidity' && styles.chartTabTextActive]}>
                            Kelembapan
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.chartTab, selectedChart === 'lux' && styles.chartTabActive]}
                        onPress={() => setSelectedChart('lux')}
                    >
                        <Text style={[styles.chartTabText, selectedChart === 'lux' && styles.chartTabTextActive]}>
                            Cahaya
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Chart */}
                <View style={styles.chartContainer}>
                    {sensorHistory.length > 0 ? (
                        <LineChart
                            data={getChartData()}
                            width={screenWidth - 48}
                            height={180}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                            withInnerLines={false}
                            withOuterLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                        />
                    ) : (
                        <View style={styles.noChartData}>
                            <Ionicons name="analytics-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.noChartText}>Menunggu data sensor...</Text>
                            <Text style={styles.noChartSubtext}>Grafik akan muncul setelah menerima data</Text>
                        </View>
                    )}
                </View>

                {/* Sensor Health Section */}
                <Text style={styles.sectionTitle}>Status Sensor</Text>
                <View style={styles.healthCard}>
                    <View style={styles.healthRow}>
                        <View style={styles.healthItem}>
                            <Ionicons
                                name={displaySensorData.sensor_health.dht_ok ? "checkmark-circle" : "close-circle"}
                                size={24}
                                color={displaySensorData.sensor_health.dht_ok ? Colors.normal : Colors.critical}
                            />
                            <Text style={styles.healthLabel}>DHT22</Text>
                            <Text style={styles.healthStatus}>
                                {displaySensorData.sensor_health.dht_ok ? 'OK' : 'Error'}
                            </Text>
                        </View>
                        <View style={styles.healthItem}>
                            <Ionicons
                                name={displaySensorData.sensor_health.photo_ok ? "checkmark-circle" : "close-circle"}
                                size={24}
                                color={displaySensorData.sensor_health.photo_ok ? Colors.normal : Colors.critical}
                            />
                            <Text style={styles.healthLabel}>Photoresistor</Text>
                            <Text style={styles.healthStatus}>
                                {displaySensorData.sensor_health.photo_ok ? 'OK' : 'Error'}
                            </Text>
                        </View>
                        <View style={styles.healthItem}>
                            <Ionicons
                                name={displaySensorData.sensor_health.soil_ok ? "checkmark-circle" : "close-circle"}
                                size={24}
                                color={displaySensorData.sensor_health.soil_ok ? Colors.normal : Colors.critical}
                            />
                            <Text style={styles.healthLabel}>Soil Sensor</Text>
                            <Text style={styles.healthStatus}>
                                {displaySensorData.sensor_health.soil_ok ? 'OK' : 'Error'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Last Update */}
                <View style={styles.lastUpdateContainer}>
                    <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.lastUpdateText}>
                        Terakhir diperbarui: {getLastUpdateText()}
                    </Text>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginLeft: 12,
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    connectionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    connectionDot: {
        marginRight: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    connectionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
        flex: 1,
    },
    reconnectText: {
        fontSize: 12,
        color: Colors.primary,
    },
    errorText: {
        fontSize: 12,
        color: Colors.critical,
    },
    predictionCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    predictionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    predictionLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    predictionStatus: {
        fontSize: 24,
        fontWeight: '700',
    },
    predictionBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    predictionCode: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textWhite,
    },
    predictionMeta: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
        marginTop: 8,
    },
    sensorRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    sensorCardHalf: {
        flex: 1,
    },
    chartSelector: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 4,
        marginBottom: 12,
    },
    chartTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    chartTabActive: {
        backgroundColor: Colors.primary,
    },
    chartTabText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    chartTabTextActive: {
        color: Colors.textWhite,
    },
    chartContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    chart: {
        borderRadius: 12,
    },
    noChartData: {
        padding: 32,
        alignItems: 'center',
    },
    noChartText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: 12,
    },
    noChartSubtext: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 4,
    },
    healthCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    healthRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    healthItem: {
        alignItems: 'center',
        gap: 6,
    },
    healthLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    healthStatus: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    lastUpdateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    lastUpdateText: {
        fontSize: 12,
        color: Colors.textMuted,
    },
});
