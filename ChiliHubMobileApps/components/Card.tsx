import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../constants/colors';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
    shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    padding = 16,
    shadow = true,
}) => {
    return (
        <View
            style={[
                styles.card,
                shadow && styles.shadow,
                { padding },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: 16,
        overflow: 'hidden',
    },
    shadow: {
        shadowColor: Colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
});

export default Card;
