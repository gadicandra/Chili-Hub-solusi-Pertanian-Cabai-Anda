import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface SettingItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    type?: 'arrow' | 'switch' | 'value';
    value?: string | boolean;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    title,
    subtitle,
    type = 'arrow',
    value,
    onPress,
    onValueChange,
}) => (
    <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={type === 'switch'}
        activeOpacity={0.7}
    >
        <View style={styles.settingIcon}>
            <Ionicons name={icon} size={20} color={Colors.primary} />
        </View>
        <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {type === 'arrow' && (
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
        {type === 'switch' && (
            <Switch
                value={value as boolean}
                onValueChange={onValueChange}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={value ? Colors.primary : Colors.textMuted}
            />
        )}
        {type === 'value' && (
            <Text style={styles.settingValue}>{value as string}</Text>
        )}
    </TouchableOpacity>
);

export default function SettingsScreen() {
    const [notifications, setNotifications] = React.useState(true);
    const [darkMode, setDarkMode] = React.useState(false);
    const [autoRefresh, setAutoRefresh] = React.useState(true);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pengaturan</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* General Settings */}
                <Text style={styles.sectionTitle}>Umum</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Notifikasi"
                        subtitle="Terima pemberitahuan sensor"
                        type="switch"
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <SettingItem
                        icon="moon-outline"
                        title="Mode Gelap"
                        type="switch"
                        value={darkMode}
                        onValueChange={setDarkMode}
                    />
                    <SettingItem
                        icon="refresh-outline"
                        title="Auto Refresh Data"
                        subtitle="Perbarui data secara otomatis"
                        type="switch"
                        value={autoRefresh}
                        onValueChange={setAutoRefresh}
                    />
                </View>

                {/* MQTT Settings */}
                <Text style={styles.sectionTitle}>Koneksi MQTT</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="server-outline"
                        title="Broker"
                        type="value"
                        value="broker.emqx.io"
                    />
                    <SettingItem
                        icon="git-network-outline"
                        title="Port"
                        type="value"
                        value="1883"
                    />
                    <SettingItem
                        icon="pulse-outline"
                        title="Topic Sensor"
                        type="value"
                        value="chilihub/data/sensors"
                    />
                    <SettingItem
                        icon="analytics-outline"
                        title="Topic Prediksi"
                        type="value"
                        value="chilihub/predictions/class"
                    />
                </View>

                {/* Data Settings */}
                <Text style={styles.sectionTitle}>Data</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="time-outline"
                        title="Riwayat Sensor"
                        subtitle="Lihat data historis"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="download-outline"
                        title="Ekspor Data"
                        subtitle="Unduh data dalam format CSV"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="trash-outline"
                        title="Hapus Cache"
                        subtitle="Bersihkan data tersimpan"
                        onPress={() => { }}
                    />
                </View>

                {/* About */}
                <Text style={styles.sectionTitle}>Tentang</Text>
                <View style={styles.sectionCard}>
                    <SettingItem
                        icon="information-circle-outline"
                        title="Versi Aplikasi"
                        type="value"
                        value="1.0.0"
                    />
                    <SettingItem
                        icon="document-text-outline"
                        title="Lisensi Open Source"
                        onPress={() => { }}
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
    backButton: {
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
    sectionCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    settingSubtitle: {
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 2,
    },
    settingValue: {
        fontSize: 14,
        color: Colors.textMuted,
    },
});
