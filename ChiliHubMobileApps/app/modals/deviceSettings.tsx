import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function DeviceSettingsModal() {
    const [deviceName, setDeviceName] = useState('Kebun belakang rumah');
    const [location, setLocation] = useState('Grendeng, Purwokerto');
    const [isLoading, setIsLoading] = useState(false);

    // Threshold settings
    const [tempMin, setTempMin] = useState('15');
    const [tempMax, setTempMax] = useState('30');
    const [humidityMin, setHumidityMin] = useState('20');
    const [humidityMax, setHumidityMax] = useState('60');

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Berhasil', 'Pengaturan berhasil disimpan', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Gagal menyimpan pengaturan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Hapus Device',
            'Apakah Anda yakin ingin menghapus device ini? Tindakan ini tidak dapat dibatalkan.',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                        // Handle delete
                        router.replace('/(main)/(tabs)/device');
                    }
                },
            ]
        );
    };

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
                <Text style={styles.headerTitle}>Pengaturan Device</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Device Info */}
                <Text style={styles.sectionTitle}>Informasi Device</Text>
                <View style={styles.card}>
                    <Input
                        label="Nama Device"
                        placeholder="Masukkan nama device"
                        value={deviceName}
                        onChangeText={setDeviceName}
                        leftIcon="hardware-chip-outline"
                    />
                    <Input
                        label="Lokasi"
                        placeholder="Masukkan lokasi"
                        value={location}
                        onChangeText={setLocation}
                        leftIcon="location-outline"
                    />
                </View>

                {/* Threshold Settings */}
                <Text style={styles.sectionTitle}>Batas Threshold</Text>
                <View style={styles.card}>
                    <Text style={styles.cardSubtitle}>Suhu (°C)</Text>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Input
                                label="Minimum"
                                placeholder="15"
                                value={tempMin}
                                onChangeText={setTempMin}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Input
                                label="Maximum"
                                placeholder="30"
                                value={tempMax}
                                onChangeText={setTempMax}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <Text style={styles.cardSubtitle}>Kelembapan Tanah (%)</Text>
                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Input
                                label="Minimum"
                                placeholder="20"
                                value={humidityMin}
                                onChangeText={setHumidityMin}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfInput}>
                            <Input
                                label="Maximum"
                                placeholder="60"
                                value={humidityMax}
                                onChangeText={setHumidityMax}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>

                {/* Device ID Info */}
                <Text style={styles.sectionTitle}>Informasi Teknis</Text>
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Device ID</Text>
                        <Text style={styles.infoValue}>ESP32-001</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>MAC Address</Text>
                        <Text style={styles.infoValue}>AA:BB:CC:DD:EE:FF</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Firmware</Text>
                        <Text style={styles.infoValue}>v1.2.0</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title="Simpan Pengaturan"
                        onPress={handleSave}
                        loading={isLoading}
                        style={styles.saveButton}
                    />
                    <Button
                        title="Hapus Device"
                        onPress={handleDelete}
                        variant="outline"
                        style={styles.deleteButton}
                        textStyle={{ color: Colors.critical }}
                    />
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
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginTop: 24,
        marginLeft: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: 8,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    actions: {
        marginTop: 32,
        gap: 12,
    },
    saveButton: {
        marginBottom: 0,
    },
    deleteButton: {
        borderColor: Colors.critical,
    },
});
