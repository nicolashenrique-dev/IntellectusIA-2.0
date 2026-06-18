import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';

const REMEMBER_ME_KEY = '@intelectus_remember_me';
const SAVED_EMAIL_KEY = '@intelectus_saved_email';
const SAVED_PASSWORD_KEY = '@intelectus_saved_password';
const SAVED_TOKEN_KEY = '@intelectus_saved_token';

const LoginScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [autoLoginChecked, setAutoLoginChecked] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));

    // Ao abrir o app, verifica se tem credenciais salvas
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const remembered = await AsyncStorage.getItem(REMEMBER_ME_KEY);
                if (remembered === 'true') {
                    const savedEmail = await AsyncStorage.getItem(SAVED_EMAIL_KEY);
                    const savedPassword = await AsyncStorage.getItem(SAVED_PASSWORD_KEY);
                    const savedToken = await AsyncStorage.getItem(SAVED_TOKEN_KEY);

                    if (savedEmail) setEmail(savedEmail);
                    if (savedPassword) setPassword(savedPassword);
                    setRememberMe(true);

                    // Auto-login se tiver token salvo
                    if (savedToken && savedEmail) {
                        navigation.replace('Dashboard', { uid: 'saved-uid' });
                        return;
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar credenciais:', error);
            } finally {
                setAutoLoginChecked(true);
            }
        };

        loadSavedCredentials();
    }, []);

    useEffect(() => {
        if (autoLoginChecked) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 30,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [autoLoginChecked]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Salvar ou limpar credenciais baseado no "Lembrar de mim"
                if (rememberMe) {
                    await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
                    await AsyncStorage.setItem(SAVED_EMAIL_KEY, email);
                    await AsyncStorage.setItem(SAVED_PASSWORD_KEY, password);
                    if (data.token) {
                        await AsyncStorage.setItem(SAVED_TOKEN_KEY, data.token);
                    }
                } else {
                    await AsyncStorage.multiRemove([REMEMBER_ME_KEY, SAVED_EMAIL_KEY, SAVED_PASSWORD_KEY, SAVED_TOKEN_KEY]);
                }

                navigation.replace('Dashboard', { uid: data.user?.uid || 'mock-uid' });
            } else {
                Alert.alert('Falha no Login', data.message || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error("Login Error:", error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    // Aguarda verificação de auto-login antes de renderizar
    if (!autoLoginChecked) {
        return (
            <LinearGradient colors={['#5849ff', '#1e1b4b']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <StatusBar barStyle="light-content" />
                <ActivityIndicator color="#fff" size="large" />
            </LinearGradient>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#5849ff', '#1e1b4b']}
                style={styles.fbContainer}
            >
                <StatusBar barStyle="light-content" />
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    bounces={false}
                >
                    <Animated.View style={[styles.fbContentArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                        {/* Header */}
                        <View style={styles.fbHeaderArea}>
                            <Text style={styles.fbTitle}>IntelectusIA</Text>
                            <Text style={styles.fbSubtitle}>Conecte-se e continue sua trilha de aprendizado.</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.fbFormCard}>
                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="E-mail ou número de telefone"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="Senha"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.fbPasswordToggle}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Text style={{ fontSize: 13, color: '#6366f1', fontWeight: '600' }}>
                                        {showPassword ? 'Ocultar' : 'Mostrar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Checkbox Lembrar de mim */}
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 4,
                                    marginBottom: 12,
                                    paddingVertical: 4,
                                }}
                                onPress={() => setRememberMe(!rememberMe)}
                                activeOpacity={0.7}
                            >
                                <View style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    borderWidth: 2,
                                    borderColor: rememberMe ? '#6366f1' : '#cbd5e1',
                                    backgroundColor: rememberMe ? '#6366f1' : 'transparent',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 10,
                                }}>
                                    {rememberMe && (
                                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', lineHeight: 16 }}>✓</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 14, color: '#64748b', fontWeight: '600' }}>
                                    Lembrar de mim
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.fbLoginButton, loading && { opacity: 0.8 }]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.fbLoginButtonText}>Entrar</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.fbForgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.fbForgotPasswordText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.fbFooterArea}>
                            <TouchableOpacity
                                style={styles.fbRegisterButton}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text style={styles.fbRegisterButtonText}>Criar nova conta</Text>
                            </TouchableOpacity>

                            <View style={styles.fbSchoolFooter}>
                                <Text style={styles.fbSchoolText}>Grupo: Fellipe, Miguel e Nicolas</Text>
                                <Text style={styles.fbSchoolText}>Professores: Douglas e Ricardo | 3º ano B</Text>
                            </View>
                        </View>

                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

export default LoginScreen;