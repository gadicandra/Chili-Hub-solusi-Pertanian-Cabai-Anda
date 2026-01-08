import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../constants/colors';
import { useAuth } from '../../../contexts/AuthContext';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    danger = false,
}) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
            <Ionicons name={icon} size={20} color={danger ? Colors.critical : Colors.primary} />
        </View>
        <View style={styles.menuContent}>
            <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {showArrow && (
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        )}
    </TouchableOpacity>
);

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Keluar',
            'Apakah Anda yakin ingin keluar?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Keluar',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="camera" size={14} color={Colors.textWhite} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                {/* Menu Sections */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Akun</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="person-outline"
                            title="Edit Profil"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="notifications-outline"
                            title="Notifikasi"
                            subtitle="Kelola pengaturan notifikasi"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="shield-checkmark-outline"
                            title="Keamanan"
                            subtitle="Password, 2FA"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Perangkat</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="hardware-chip-outline"
                            title="Device Saya"
                            subtitle="2 device terhubung"
                            onPress={() => router.push('/(main)/(tabs)/device')}
                        />
                        <MenuItem
                            icon="wifi-outline"
                            title="Koneksi MQTT"
                            subtitle="broker.emqx.io"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Lainnya</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="help-circle-outline"
                            title="Bantuan & FAQ"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="document-text-outline"
                            title="Syarat & Ketentuan"
                            onPress={() => { }}
                        />
                        <MenuItem
                            icon="information-circle-outline"
                            title="Tentang Aplikasi"
                            subtitle="Versi 1.0.0"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="log-out-outline"
                            title="Keluar"
                            onPress={handleLogout}
                            showArrow={false}
                            danger
                        />
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
        paddingBottom: 24,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: Colors.surface,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '600',
        color: Colors.textWhite,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    menuSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    menuIconDanger: {
        backgroundColor: Colors.statusCriticalBg,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    menuTitleDanger: {
        color: Colors.critical,
    },
    menuSubtitle: {
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 2,
    },
});
