import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,

} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/autenticacao/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erro ao fazer login');
                return;
            }

            // Armazenar token e navegar
            // await AsyncStorage.setItem('authToken', data.token);
            navigation.replace('Home');
        } catch (err) {
            setError('Erro de conexão. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroBackground}>
                    <View style={styles.heroCircleTop} />
                    <View style={styles.heroCircleBottom} />
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>IntelectusIA</Text>
                        <Text style={styles.heroSubtitle}>Descubra seu caminho profissional com inteligência artificial.</Text>
                    </View>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Bem-vindo de volta</Text>
                    <Text style={styles.formSubtitle}>Faça login para continuar sua trilha</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>E-mail</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="seu@email.com"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                style={styles.passwordToggle}
                            >
                                <Text style={styles.passwordToggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.registerText}>
                        Não tem conta?{' '}
                        <Text style={styles.registerLink} onPress={handleRegister}>Cadastre-se</Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5849ff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    heroBackground: {
        paddingTop: Platform.OS === 'android' ? 60 : 70,
        paddingBottom: 40,
        paddingHorizontal: 30,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        backgroundColor: '#5849ff',
        overflow: 'hidden',
    },
    heroCircleTop: {
        position: 'absolute',
        top: -60,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroCircleBottom: {
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    heroContent: {
        marginTop: 20,
    },
    heroTitle: {
        fontSize: 38,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 14,
        letterSpacing: -0.8,
    },
    heroSubtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(255,255,255,0.9)',
        maxWidth: '90%',
    },
    formCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: -40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 30,
        paddingTop: 40,
        minHeight: 520,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 8,
    },
    formTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
    },
    formSubtitle: {
        color: '#94a3b8',
        fontSize: 15,
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 22,
    },
    label: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 18,
        height: 64,
        paddingHorizontal: 18,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1e293b',
        fontSize: 16,
        fontWeight: '500',
    },
    passwordToggle: {
        padding: 12,
    },
    passwordToggleText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '700',
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        color: '#5849ff',
        fontSize: 14,
        fontWeight: '700',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 18,
        textAlign: 'center',
    },
    loginButton: {
        height: 60,
        backgroundColor: '#5849ff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5849ff',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 22,
        elevation: 8,
        marginBottom: 24,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    registerText: {
        textAlign: 'center',
        marginTop: 6,
        color: '#64748b',
        fontSize: 15,
        fontWeight: '500',
    },
    registerLink: {
        color: '#5849ff',
        fontWeight: '800',
    },
});

export default Login;
