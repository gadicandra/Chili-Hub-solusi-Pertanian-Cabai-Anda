import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        if (!name) {
            newErrors.name = 'Nama harus diisi';
        } else if (name.length < 3) {
            newErrors.name = 'Nama minimal 3 karakter';
        }

        if (!email) {
            newErrors.email = 'Email harus diisi';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!password) {
            newErrors.password = 'Password harus diisi';
        } else if (password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Konfirmasi password harus diisi';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Password tidak cocok';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const success = await register({ name, email, password, confirmPassword });
            if (success) {
                Alert.alert('Berhasil', 'Akun berhasil dibuat!', [
                    { text: 'OK', onPress: () => router.replace('/(main)/(tabs)/beranda') }
                ]);
            } else {
                Alert.alert('Gagal', 'Terjadi kesalahan saat mendaftar.');
            }
        } catch (error) {
            Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/Chili-HubLogo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.title}>Buat Akun Baru</Text>
                        <Text style={styles.subtitle}>Daftar untuk mulai menggunakan ChiliHub</Text>

                        <Input
                            label="Nama Lengkap"
                            placeholder="Masukkan nama lengkap"
                            value={name}
                            onChangeText={setName}
                            leftIcon="person-outline"
                            error={errors.name}
                        />

                        <Input
                            label="Email"
                            placeholder="Masukkan email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="Masukkan password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                        />

                        <Input
                            label="Konfirmasi Password"
                            placeholder="Masukkan ulang password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.confirmPassword}
                        />

                        <Button
                            title="Daftar"
                            onPress={handleRegister}
                            loading={isLoading}
                            style={styles.registerButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Sudah punya akun? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.loginLink}>Masuk</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 60,
        height: 60,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.primary,
    },
    formSection: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 32,
    },
    registerButton: {
        marginTop: 8,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingVertical: 24,
    },
    footerText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    loginLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
});
