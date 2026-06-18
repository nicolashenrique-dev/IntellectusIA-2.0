import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, TouchableWithoutFeedback, Keyboard, Animated, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';

const RegisterScreen = ({ navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
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
    }, []);

    const handleRegister = async () => {
        if (!nome || !email || !password || !confirmPassword) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/autenticacao/cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, password })
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert(
                    'Conta Criada! ✅',
                    'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
                    [{ text: 'Ir para Login', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Erro no Cadastro', data.message || 'Não foi possível criar sua conta.');
            }
        } catch (error) {
            console.error("Register Error:", error);
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
                            <Text style={styles.fbTitle}>Criar Conta</Text>
                            <Text style={styles.fbSubtitle}>Preencha seus dados para começar sua jornada de aprendizado.</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.fbFormCard}>
                            {/* Nome */}
                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="Nome completo"
                                    placeholderTextColor="#94a3b8"
                                    value={nome}
                                    onChangeText={setNome}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>

                            {/* Email */}
                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="E-mail"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            {/* Senha */}
                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="Senha (mínimo 6 caracteres)"
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

                            {/* Confirmar Senha */}
                            <View style={styles.fbInputWrapper}>
                                <TextInput
                                    style={styles.fbInput}
                                    placeholder="Confirmar senha"
                                    placeholderTextColor="#94a3b8"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={styles.fbPasswordToggle}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Text style={{ fontSize: 13, color: '#6366f1', fontWeight: '600' }}>
                                        {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Botão Cadastrar */}
                             <TouchableOpacity
                                 style={[styles.fbLoginButton, loading && { opacity: 0.8 }]}
                                 onPress={handleRegister}
                                 disabled={loading}
                             >
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.fbLoginButtonText}>Cadastrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer - Voltar para login */}
                        <View style={styles.fbFooterArea}>
                             <TouchableOpacity
                                 style={styles.fbRegisterButton}
                                 onPress={() => navigation.goBack()}
                             >
                                 <Text style={styles.fbRegisterButtonText}>Já tenho uma conta</Text>
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

export default RegisterScreen;
