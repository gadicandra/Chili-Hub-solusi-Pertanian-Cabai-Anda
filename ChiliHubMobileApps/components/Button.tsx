import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import Colors from '../constants/colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const getButtonStyle = (): ViewStyle[] => {
        const baseStyle: ViewStyle[] = [styles.base, styles[size]];

        if (variant === 'primary') {
            baseStyle.push(styles.primary);
        } else if (variant === 'secondary') {
            baseStyle.push(styles.secondary);
        } else if (variant === 'outline') {
            baseStyle.push(styles.outline);
        }

        if (disabled || loading) {
            baseStyle.push(styles.disabled);
        }

        return baseStyle;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseTextStyle: TextStyle[] = [styles.text, styles[`${size}Text`]];

        if (variant === 'outline') {
            baseTextStyle.push(styles.outlineText);
        } else {
            baseTextStyle.push(styles.whiteText);
        }

        return baseTextStyle;
    };

    return (
        <TouchableOpacity
            style={[...getButtonStyle(), style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' ? Colors.primary : Colors.textWhite}
                />
            ) : (
                <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Sizes
    small: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    medium: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    large: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    // Variants
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.primaryDark,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    disabled: {
        opacity: 0.6,
    },
    // Text
    text: {
        fontWeight: '600',
    },
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    whiteText: {
        color: Colors.textWhite,
    },
    outlineText: {
        color: Colors.primary,
    },
});

export default Button;
