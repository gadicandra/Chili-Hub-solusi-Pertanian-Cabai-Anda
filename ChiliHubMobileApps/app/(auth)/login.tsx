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
import Colors from '../../constants/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { identifier?: string; password?: string } = {};

        if (!identifier) {
            newErrors.identifier = 'Email atau username harus diisi';
        }

        if (!password) {
            newErrors.password = 'Password harus diisi';
        } else if (password.length < 5) {
            newErrors.password = 'Password minimal 5 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const success = await login({ identifier, password });
            if (success) {
                router.replace('/(main)/(tabs)/beranda');
            } else {
                Alert.alert(
                    'Login Gagal',
                    'Email/username atau password salah.'
                );
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
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/Chili-HubLogo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.tagline}>Solusi untuk Pertanian Cabai Anda</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.title}>Selamat Datang!</Text>
                        <Text style={styles.subtitle}>Masuk ke akun Anda</Text>

                        <Input
                            label="Email atau Username"
                            placeholder="Masukkan email atau username"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                            leftIcon="person-outline"
                            error={errors.identifier}
                        />

                        <Input
                            label="Password"
                            placeholder="Masukkan password Anda"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={errors.password}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Link href="/(auth)/forgotPassword" asChild>
                                <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
                            </Link>
                        </TouchableOpacity>

                        <Button
                            title="Masuk"
                            onPress={handleLogin}
                            loading={isLoading}
                            style={styles.loginButton}
                        />

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>atau</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Button
                            title="Masuk dengan Google"
                            onPress={() => Alert.alert('Info', 'Fitur Google Sign-In belum tersedia')}
                            variant="outline"
                            style={styles.googleButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Belum punya akun? </Text>
                        <Link href="/(auth)/register" asChild>
                            <TouchableOpacity>
                                <Text style={styles.registerLink}>Daftar Sekarang</Text>
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
    logoSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    logoContainer: {
        width: 120,
        height: 60,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 100,
        height: 100,
        backgroundColor: Colors.background,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: Colors.textSecondary,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '500',
    },
    loginButton: {
        marginBottom: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: Colors.textMuted,
        fontSize: 14,
    },
    googleButton: {
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
    registerLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
});
