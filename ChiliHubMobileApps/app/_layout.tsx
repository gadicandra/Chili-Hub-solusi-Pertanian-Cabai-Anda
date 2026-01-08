import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { MqttProvider } from '../contexts/MqttContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

function RootLayoutNav() {
    const { isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="(main)" />
                ) : (
                    <Stack.Screen name="(auth)" />
                )}
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <MqttProvider>
                <RootLayoutNav />
            </MqttProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
