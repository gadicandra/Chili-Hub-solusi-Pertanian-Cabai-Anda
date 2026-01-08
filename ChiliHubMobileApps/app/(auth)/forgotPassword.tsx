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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (): boolean => {
        if (!email) {
            setError('Email harus diisi');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Format email tidak valid');
            return false;
        }
        setError('');
        return true;
    };

    const handleResetPassword = async () => {
        if (!validateEmail()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSent(true);
        } catch (error) {
            Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Ionicons name="mail" size={48} color={Colors.primary} />
                    </View>
                    <Text style={styles.successTitle}>Email Terkirim!</Text>
                    <Text style={styles.successText}>
                        Kami telah mengirimkan link reset password ke {email}.
                        Silakan cek inbox Anda.
                    </Text>
                    <Button
                        title="Kembali ke Login"
                        onPress={() => router.replace('/(auth)/login')}
                        style={styles.backToLoginButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

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

                    {/* Icon Section */}
                    <View style={styles.iconSection}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-open-outline" size={48} color={Colors.primary} />
                        </View>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formSection}>
                        <Text style={styles.title}>Lupa Password?</Text>
                        <Text style={styles.subtitle}>
                            Jangan khawatir! Masukkan email yang terdaftar dan kami akan
                            mengirimkan link untuk reset password Anda.
                        </Text>

                        <Input
                            label="Email"
                            placeholder="Masukkan email Anda"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            error={error}
                        />

                        <Button
                            title="Kirim Link Reset"
                            onPress={handleResetPassword}
                            loading={isLoading}
                            style={styles.resetButton}
                        />
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
        marginBottom: 32,
    },
    iconSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formSection: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: 32,
    },
    resetButton: {
        marginTop: 8,
    },
    // Success state
    successContainer: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.statusNormalBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    successText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    backToLoginButton: {
        width: '100%',
    },
});
