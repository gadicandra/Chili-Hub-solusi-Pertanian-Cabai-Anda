import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/types';

// Dummy user for testing
const DUMMY_USER: User = {
    id: '1',
    name: 'Boer',
    username: 'boer',
    email: 'user@chilihub.com',
    location: 'Samarinda',
};

const DUMMY_CREDENTIALS = {
    email: 'user@chilihub.com',
    username: 'user',
    password: '12345',
};

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
    });

    // Check for existing session on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const userJson = await SecureStore.getItemAsync(USER_KEY);

            if (token && userJson) {
                const user = JSON.parse(userJson) as User;
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    token,
                });
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Dummy authentication - check if identifier is email or username
            const isValidCredentials = (
                (credentials.identifier === DUMMY_CREDENTIALS.email ||
                    credentials.identifier === DUMMY_CREDENTIALS.username) &&
                credentials.password === DUMMY_CREDENTIALS.password
            );

            if (isValidCredentials) {
                const token = 'dummy_jwt_token_' + Date.now();

                await SecureStore.setItemAsync(TOKEN_KEY, token);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(DUMMY_USER));

                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: DUMMY_USER,
                    token,
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (data: RegisterData): Promise<boolean> => {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Dummy registration - always succeeds
            const newUser: User = {
                id: Date.now().toString(),
                name: data.name,
                email: data.email,
            };

            const token = 'dummy_jwt_token_' + Date.now();

            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));

            setState({
                isAuthenticated: true,
                isLoading: false,
                user: newUser,
                token,
            });

            return true;
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(USER_KEY);

            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = (userData: Partial<User>) => {
        if (state.user) {
            const updatedUser = { ...state.user, ...userData };
            setState(prev => ({ ...prev, user: updatedUser }));
            SecureStore.setItemAsync(USER_KEY, JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;