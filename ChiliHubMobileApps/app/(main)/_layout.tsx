import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../constants/colors';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
                name="deviceDetail/[id]"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="settings"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
        </Stack>
    );
}
