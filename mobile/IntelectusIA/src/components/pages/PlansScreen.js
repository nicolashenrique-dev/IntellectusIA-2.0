import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';

const PLANS = [
  { id: 'Gratuito', name: 'Free', price: 'R$ 0', period: '/mês', desc: 'Ideal para iniciar', features: ['1 Trilha de estudos ativa', 'IA modo padrão', 'Acesso à comunidade'] },
  { id: 'Pro', name: 'Pro', price: 'R$ 19,90', period: '/mês', desc: 'Mais acessado', features: ['Trilhas ilimitadas', 'IA com modo avançado', 'Exportar roteiros em PDF'], popular: true },
  { id: 'Premium', name: 'Premium', price: 'R$ 39,90', period: '/mês', desc: 'Acelere sua carreira', features: ['Tudo do Pro', 'Mentoria e suporte prioritário', 'Análises detalhadas com IA'] }
];

const PlansScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const styles = isDarkMode ? darkStyles : lightStyles;
  const [currentPlan, setCurrentPlan] = useState('Gratuito');

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem('@intelectus_user_plan');
        if (savedPlan) setCurrentPlan(savedPlan);
      } catch (err) {
        console.error(err);
      }
    };
    loadPlan();
  }, []);

  const handleSelectPlan = async (planId) => {
    try {
      await AsyncStorage.setItem('@intelectus_user_plan', planId);
      setCurrentPlan(planId);
      Alert.alert(
        'Plano Atualizado! 🚀',
        `Parabéns! Você assinou o Plano ${planId} com sucesso.`,
        [{ text: 'Entendido', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? '#0a0f1d' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Personalizado */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? '#1e293b' : '#e2e8f0',
        backgroundColor: isDarkMode ? '#0a0f1d' : '#fff'
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Feather name="arrow-left" size={20} color="#5849ff" />
          <Text style={{ color: '#5849ff', fontSize: 16, fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: 18, fontWeight: '800' }}>
          Planos
        </Text>
        <View style={{ width: 60 }} /> {/* Espaçador */}
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: 26, fontWeight: '900', textAlign: 'center' }}>
            Planos Disponíveis
          </Text>
          <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 14, textAlign: 'center', marginTop: 6, paddingHorizontal: 10 }}>
            Escolha o plano ideal para alavancar e organizar sua trilha de estudos com inteligência artificial.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <View 
                key={plan.id}
                style={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  borderWidth: isCurrent ? 2.5 : 1,
                  borderColor: isCurrent ? '#5849ff' : (isDarkMode ? '#334155' : '#e2e8f0'),
                  borderRadius: 20,
                  padding: 20,
                  position: 'relative',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDarkMode ? 0.2 : 0.05,
                  shadowRadius: 10,
                  elevation: 2
                }}
              >
                {plan.popular && (
                  <View style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(88, 73, 255, 0.15)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#5849ff'
                  }}>
                    <Text style={{ color: '#818cf8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>Popular</Text>
                  </View>
                )}
                
                <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: 20, fontWeight: '800' }}>
                  Plano {plan.name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
                  <Text style={{ color: '#5849ff', fontSize: 28, fontWeight: '900' }}>{plan.price}</Text>
                  <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 14 }}>{plan.period}</Text>
                </View>
                
                <Text style={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>
                  {plan.desc}
                </Text>
                
                {/* Divisor */}
                <View style={{ height: 1, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9', marginVertical: 14 }} />

                {/* Features */}
                <View style={{ gap: 8 }}>
                  {plan.features.map((feat, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name="check" size={16} color="#10b981" />
                      <Text style={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 14 }}>{feat}</Text>
                    </View>
                  ))}
                </View>
                
                {/* Botão de Seleção */}
                <TouchableOpacity
                  onPress={() => handleSelectPlan(plan.id)}
                  disabled={isCurrent}
                  style={{
                    backgroundColor: isCurrent ? (isDarkMode ? '#334155' : '#e2e8f0') : '#5849ff',
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginTop: 20,
                    shadowColor: '#5849ff',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isCurrent ? 0 : 0.25,
                    shadowRadius: 8,
                    elevation: isCurrent ? 0 : 3
                  }}
                >
                  <Text style={{ color: isCurrent ? (isDarkMode ? '#94a3b8' : '#64748b') : '#fff', fontWeight: '800', fontSize: 15 }}>
                    {isCurrent ? 'Plano Atual Ativo' : 'Escolher este Plano'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default PlansScreen;
