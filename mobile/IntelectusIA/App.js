import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/components/pages/LoginScreen';
import RegisterScreen from './src/components/pages/RegisterScreen';
import ForgotPasswordScreen from './src/components/pages/ForgotPasswordScreen';
import Principal from './src/components/pages/Principal';
import QuizScreen from './src/components/pages/QuizScreen';
import RoadmapScreen from './src/components/pages/RoadmapScreen';
import ProfileTab from './src/components/pages/ProfileTab';
import PlansScreen from './src/components/pages/PlansScreen';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { ThemeProvider } from './src/contexts/ThemeContext';
import { AudioProvider } from './src/contexts/AudioContext';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [currentPlan, setCurrentPlan] = useState('Gratuito');
  const [avatarPreset, setAvatarPreset] = useState('user');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Sincronizar dados do usuário salvos no AsyncStorage em tempo real
  useEffect(() => {
    const syncUserData = async () => {
      try {
        const plan = await AsyncStorage.getItem('@intelectus_user_plan');
        if (plan) setCurrentPlan(plan);
        const preset = await AsyncStorage.getItem('@intelectus_user_avatar_preset');
        if (preset) setAvatarPreset(preset);
        const url = await AsyncStorage.getItem('@intelectus_user_avatar_url');
        setCustomAvatarUrl(url || '');
      } catch (err) {
        console.error(err);
      }
    };
    syncUserData();
    const interval = setInterval(syncUserData, 2000); // Polling simples de 2s para sincronia
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@intelectus_saved_token',
        '@intelectus_user_uid'
      ]);
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Erro ao sair pelo menu lateral:', err);
    }
  };

  const renderDrawerAvatar = () => {
    if (customAvatarUrl) {
      return (
        <Image 
          source={{ uri: customAvatarUrl }} 
          style={{ width: 76, height: 76, borderRadius: 38 }} 
        />
      );
    }
    const PRESETS = {
      user: { icon: 'user', color: '#6366f1' },
      dev: { icon: 'code', color: '#10b981' },
      design: { icon: 'feather', color: '#ec4899' },
      sci: { icon: 'award', color: '#f59e0b' }
    };
    const preset = PRESETS[avatarPreset] || PRESETS.user;
    return <Feather name={preset.icon} size={36} color={preset.color} />;
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      contentContainerStyle={{ flex: 1, backgroundColor: '#0f172a' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho do Menu Lateral com Dados do Estudante */}
      <View style={{ 
        padding: 24, 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255, 255, 255, 0.08)', 
        alignItems: 'center', 
        marginBottom: 20 
      }}>
        <View style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: 'rgba(88, 73, 255, 0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#5849ff',
          marginBottom: 12
        }}>
          {renderDrawerAvatar()}
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Estudante Intelectus</Text>
        <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Plano {currentPlan}</Text>
      </View>

      {/* Itens de Navegação do Drawer */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
        
        <DrawerItem
          label="Gerar Nova Trilha"
          labelStyle={{ color: '#cbd5e1', fontSize: 15, fontWeight: '600' }}
          icon={({ color, size }) => <Feather name="plus-circle" size={20} color="#5849ff" />}
          onPress={async () => {
            const uid = await AsyncStorage.getItem('@intelectus_user_uid') || 'mock-uid';
            props.navigation.navigate('Quiz', { uid });
          }}
        />
        
        <DrawerItem
          label="Configurações"
          labelStyle={{ color: '#cbd5e1', fontSize: 15, fontWeight: '600' }}
          icon={({ color, size }) => <Feather name="settings" size={20} color="#64748b" />}
          onPress={() => props.navigation.navigate('DashboardRoot')}
        />
      </View>

      {/* Rodapé - Botão Sair da Conta */}
      <View style={{ 
        padding: 16, 
        borderTopWidth: 1, 
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        marginTop: 'auto'
      }}>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 10,
            justifyContent: 'center',
            gap: 10
          }}
        >
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '700' }}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0f1d', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#0f172a', width: 280 },
        drawerActiveTintColor: '#fff',
        drawerActiveBackgroundColor: '#5849ff',
        drawerInactiveTintColor: '#cbd5e1',
        drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
      }}
    >
      <Drawer.Screen
        name="DashboardRoot"
        component={Principal}
        options={{ 
          title: 'Início', 
          headerTitle: '',
          drawerIcon: ({ color }) => <Feather name="home" size={20} color={color} />
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#090e1d' }
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Dashboard" component={MainDrawer} />
            <Stack.Screen name="Quiz" component={QuizScreen} />
            <Stack.Screen name="Roadmap" component={RoadmapScreen} />
            <Stack.Screen name="Profile" component={ProfileTab} />
            <Stack.Screen name="Plans" component={PlansScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </ThemeProvider>
  );
}
