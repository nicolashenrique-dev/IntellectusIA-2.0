import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';

const ForgotPasswordScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
    
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [step, setStep] = useState(1); // 1: Pedir código, 2: Digitar código e nova senha
    const [loading, setLoading] = useState(false);
    const [receivedCode, setReceivedCode] = useState(''); // Armazena o código retornado para facilitação de testes
    
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(20));

    React.useEffect(() => {
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
    }, [step]); // Executa a animação também ao mudar de etapa

    const handleRequestCode = async () => {
        if (!email) {
            Alert.alert('Erro', 'Por favor, preencha o campo de e-mail.');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/recuperar-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                // Guarda o código para exibir na tela facilitando testes
                if (data.code) {
                    setReceivedCode(data.code);
                }
                Alert.alert(
                    'Código Enviado! 🔑',
                    'Um código de 6 dígitos foi gerado para recuperação da sua conta.',
                    [{ text: 'Prosseguir', onPress: () => setStep(2) }]
                );
            } else {
                Alert.alert('Erro', data.message || 'E-mail não encontrado.');
            }
        } catch (error) {
            console.error("Request Reset Code Error:", error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !newPassword || !confirmNewPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/resetar-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert(
                    'Senha Redefinida! 🎉',
                    'Sua senha foi redefinida com sucesso. Faça login com suas novas credenciais.',
                    [{ text: 'Entrar', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                Alert.alert('Erro', data.message || 'Código de verificação inválido.');
            }
        } catch (error) {
            console.error("Reset Password Error:", error);
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
        } finally {
            setLoading(false);
        }
    };

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
                            <Text style={styles.fbTitle}>Recuperar Senha</Text>
                            <Text style={styles.fbSubtitle}>
                                {step === 1 
                                    ? 'Digite o seu e-mail para receber um código de redefinição.' 
                                    : 'Digite o código de 6 dígitos enviado e defina sua nova senha.'
                                }
                            </Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.fbFormCard}>
                            {step === 1 ? (
                                <View>
                                    <View style={styles.fbInputWrapper}>
                                        <TextInput
                                            style={styles.fbInput}
                                            placeholder="E-mail cadastrado"
                                            placeholderTextColor="#94a3b8"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            editable={!loading}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.fbLoginButton, loading && { opacity: 0.8 }]}
                                        onPress={handleRequestCode}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.fbLoginButtonText}>Enviar Código</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    {/* Exibição facilitadora do código em testes locais */}
                                    {receivedCode ? (
                                        <View style={{
                                            backgroundColor: 'rgba(88, 73, 255, 0.15)',
                                            borderWidth: 1,
                                            borderColor: '#5849ff',
                                            borderRadius: 8,
                                            padding: 12,
                                            marginBottom: 16,
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
                                                Ambiente de Teste: Código Gerado
                                            </Text>
                                            <Text style={{ color: '#5849ff', fontSize: 22, fontWeight: '900', marginTop: 4, letterSpacing: 2 }}>
                                                {receivedCode}
                                            </Text>
                                        </View>
                                    ) : null}

                                    <View style={styles.fbInputWrapper}>
                                        <TextInput
                                            style={styles.fbInput}
                                            placeholder="Código de 6 dígitos"
                                            placeholderTextColor="#94a3b8"
                                            value={code}
                                            onChangeText={setCode}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            editable={!loading}
                                        />
                                    </View>

                                    <View style={styles.fbInputWrapper}>
                                        <TextInput
                                            style={styles.fbInput}
                                            placeholder="Nova Senha"
                                            placeholderTextColor="#94a3b8"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
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

                                    <View style={styles.fbInputWrapper}>
                                        <TextInput
                                            style={styles.fbInput}
                                            placeholder="Confirmar Nova Senha"
                                            placeholderTextColor="#94a3b8"
                                            value={confirmNewPassword}
                                            onChangeText={setConfirmNewPassword}
                                            secureTextEntry={!showPassword}
                                            editable={!loading}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.fbLoginButton, loading && { opacity: 0.8 }]}
                                        onPress={handleResetPassword}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.fbLoginButtonText}>Redefinir Senha</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{ marginTop: 12, alignItems: 'center' }}
                                        onPress={() => setStep(1)}
                                    >
                                        <Text style={{ color: '#6366f1', fontSize: 14, fontWeight: '600' }}>
                                            Reenviar Código
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Footer */}
                        <View style={styles.fbFooterArea}>
                            <TouchableOpacity
                                style={styles.fbRegisterButton}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Text style={styles.fbRegisterButtonText}>Voltar para o Login</Text>
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

export default ForgotPasswordScreen;
