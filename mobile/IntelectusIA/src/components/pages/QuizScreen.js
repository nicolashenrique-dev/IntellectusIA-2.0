import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';
import { Ionicons } from '@expo/vector-icons';

const questions = [
    {
        id: 1,
        title: "Área de interesse?",
        subtitle: "Escolha seu campo de estudo.",
        options: [
            { label: "Tecnologia e Programação", value: "TI", icon: "laptop-outline" },
            { label: "Design e Criatividade", value: "DESIGN", icon: "color-palette-outline" },
            { label: "Negócios e Marketing", value: "MARKETING", icon: "stats-chart-outline" },
            { label: "Ciência de Dados", value: "DATA", icon: "pie-chart-outline" }
        ]
    },
    {
        id: 2,
        title: "Qual seu nível?",
        subtitle: "Isso define o ponto de partida.",
        options: [
            { label: "Iniciante Total", value: "BEGINNER", icon: "leaf-outline" },
            { label: "Tenho alguma base", value: "INTERMEDIATE", icon: "rocket-outline" },
            { label: "Já atuo na área", value: "ADVANCED", icon: "star-outline" }
        ]
    },
    {
        id: 3,
        title: "Qual seu objetivo?",
        subtitle: "Define os conteúdos recomendados.",
        options: [
            { label: "Primeiro emprego", value: "JOB", icon: "briefcase-outline" },
            { label: "Transição de carreira", value: "TRANSITION", icon: "swap-horizontal-outline" },
            { label: "Especialização técnica", value: "SPECIALIZATION", icon: "construct-outline" }
        ]
    }
];

const QuizScreen = ({ navigation, route }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
    const { uid } = route.params || {};
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOption = (value) => {
        const newAnswers = { ...answers, [questions[step].id]: value };
        setAnswers(newAnswers);
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            completeQuiz(newAnswers);
        }
    };

    const completeQuiz = async (finalAnswers) => {
        setLoading(true);
        setError('');
        try {
            const interest = questions[0].options.find(o => o.value === finalAnswers[1])?.label;
            const level = questions[1].options.find(o => o.value === finalAnswers[2])?.label;
            const goal = questions[2].options.find(o => o.value === finalAnswers[3])?.label;

            const baseUrl = getBaseUrl();
            // Enviando o Perfil como QuizProfile
            const response = await fetch(`${baseUrl}/api/trilhas/gerar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: { interest, experience: level, goal },
                    uid: uid || 'mock-user-uid'
                })
            });

            const data = await response.json();
            if (data.success && data.roadmap) {
                // Navegar passando a trilha e o UID para persistência
                navigation.navigate('Roadmap', { roadmap: data.roadmap, uid });
            } else {
                setError(data.message || 'Erro ao gerar trilha');
            }
        } catch (err) {
            console.error(err);
            setError('Erro de conexão com o servidor');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={[styles.greetingSubtitle, { marginTop: 16 }]}>IA montando sua trilha...</Text>
            </View>
        );
    }

    const currentQ = questions[step];

    return (
        <ScrollView style={styles.mainContainer} contentContainerStyle={styles.mainContent}>
            <View style={[styles.header, { marginBottom: 18, alignItems: 'center' }]}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => navigation.navigate('Dashboard', { uid })}
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutButtonText}>Voltar pra tela principal</Text>
                </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 40, marginTop: 20 }}>
                <Text style={{ color: '#6366f1', fontWeight: 'bold', marginBottom: 8 }}>
                    PASSO {step + 1} DE {questions.length}
                </Text>
                <Text style={styles.greetingTitle}>{currentQ.title}</Text>
                <Text style={styles.greetingSubtitle}>{currentQ.subtitle}</Text>
            </View>

            <View style={{ gap: 12 }}>
                {currentQ.options.map((opt) => (
                    <TouchableOpacity
                        key={opt.value}
                        style={[styles.highlightCard, { flexDirection: 'row', alignItems: 'center', padding: 20 }]}
                        onPress={() => handleOption(opt.value)}
                    >
                        <Ionicons name={opt.icon} size={28} color="#6366f1" style={{ marginRight: 16 }} />
                        <Text style={[styles.highlightTitle, { marginBottom: 0 }]}>{opt.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {error ? <Text style={{ color: '#ef4444', textAlign: 'center', marginTop: 16 }}>{error}</Text> : null}
        </ScrollView>
    );
};

export default QuizScreen;
