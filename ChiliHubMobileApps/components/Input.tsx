import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

interface InputProps {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    style?: ViewStyle;
    inputStyle?: TextStyle;
    editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    style,
    inputStyle,
    editable = true,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

    const handleTogglePassword = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                    !editable && styles.inputDisabled,
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={error ? Colors.critical : Colors.textMuted}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[styles.input, inputStyle]}
                    placeholder={placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={editable}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={handleTogglePassword} style={styles.rightIcon}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                        <Ionicons name={rightIcon} size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 16,
    },
    inputFocused: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: Colors.critical,
    },
    inputDisabled: {
        backgroundColor: Colors.background,
        opacity: 0.7,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    leftIcon: {
        marginRight: 12,
    },
    rightIcon: {
        marginLeft: 12,
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: Colors.critical,
        marginTop: 4,
    },
});

export default Input;
