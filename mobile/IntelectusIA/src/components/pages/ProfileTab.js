import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Image, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { useAudio } from '../../contexts/AudioContext';
import { showAlert } from '../../utils';

const PRESET_AVATARS = [
  { id: 'user', label: 'Estudante', icon: 'user', color: '#6366f1' },
  { id: 'dev', label: 'Programador', icon: 'code', color: '#10b981' },
  { id: 'design', label: 'Designer', icon: 'feather', color: '#ec4899' },
  { id: 'sci', label: 'Cientista', icon: 'award', color: '#f59e0b' }
];

const ProfileTab = ({ trilhaAtual, calculateProgress, navigation }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isMusicEnabled, toggleMusic } = useAudio();
  const styles = isDarkMode ? darkStyles : lightStyles;
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('Gratuito');
  const [avatarPreset, setAvatarPreset] = useState('user');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Carregar dados salvos do usuário ao iniciar e manter em sincronia rápida
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedPlan = await AsyncStorage.getItem('@intelectus_user_plan');
        if (savedPlan) setCurrentPlan(savedPlan);

        const savedPreset = await AsyncStorage.getItem('@intelectus_user_avatar_preset');
        if (savedPreset) setAvatarPreset(savedPreset);

        const savedUrl = await AsyncStorage.getItem('@intelectus_user_avatar_url');
        if (savedUrl) {
          setCustomAvatarUrl(savedUrl);
          setUrlInput(savedUrl);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      }
    };
    loadUserData();
    
    // Pequeno listener periódico para atualizar o plano/avatar caso mude em outra tela
    const interval = setInterval(loadUserData, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotifications = () => setNotificationsEnabled(previousState => !previousState);

  const selectPreset = async (presetId) => {
    try {
      await AsyncStorage.setItem('@intelectus_user_avatar_preset', presetId);
      await AsyncStorage.removeItem('@intelectus_user_avatar_url');
      setAvatarPreset(presetId);
      setCustomAvatarUrl('');
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const saveCustomUrl = async () => {
    if (!urlInput.trim()) {
      showAlert('Erro', 'Por favor, insira um endereço de imagem válido.');
      return;
    }
    try {
      await AsyncStorage.setItem('@intelectus_user_avatar_url', urlInput.trim());
      setCustomAvatarUrl(urlInput.trim());
      setIsModalVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const renderActiveAvatar = () => {
    if (customAvatarUrl) {
      return (
        <Image 
          source={{ uri: customAvatarUrl }} 
          style={{ width: 80, height: 80, borderRadius: 40 }} 
        />
      );
    }
    const preset = PRESET_AVATARS.find(p => p.id === avatarPreset) || PRESET_AVATARS[0];
    return <Feather name={preset.icon} size={36} color={preset.color} />;
  };

  return (
    <View style={styles.profileContainer}>
      
      {/* Cabeçalho do Perfil (Tighter / Spacing Reduced) */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity 
          style={styles.profileAvatar}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          {renderActiveAvatar()}
          {/* Badge para editar */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: '#5849ff',
            width: 26,
            height: 26,
            borderRadius: 13,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isDarkMode ? '#1e293b' : '#fff'
          }}>
            <Feather name="edit-2" size={12} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: 22, fontWeight: '900', marginTop: 10 }}>
          Estudante Intelectus
        </Text>
        <View style={{
          backgroundColor: currentPlan === 'Premium' ? '#f59e0b' : currentPlan === 'Pro' ? '#5849ff' : '#64748b',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
          marginTop: 4
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
            Plano {currentPlan}
          </Text>
        </View>
      </View>

      {/* Grid de Estatísticas */}
      <View style={styles.cardsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Módulos</Text>
          <Text style={styles.statValue}>
            {trilhaAtual?.nodes?.length || 0}
          </Text>
        </View>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>Progresso</Text>
          <Text style={styles.statValue}>
            {calculateProgress ? calculateProgress(trilhaAtual) : 0}%
          </Text>
        </View>
      </View>

      {/* Seção de Configurações */}
      <View style={[styles.section, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Configurações</Text>

        {/* Item: Ver Planos Disponíveis (Nova Rota) */}
        <TouchableOpacity
          style={styles.moduleItem}
          onPress={() => navigation.navigate('Plans')}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.moduleIcon, { backgroundColor: 'rgba(88, 73, 255, 0.1)' }]}>
              <Feather name="credit-card" size={20} color="#5849ff" />
            </View>
            <Text style={styles.moduleTitle}>Ver Planos Disponíveis</Text>
          </View>
          <Feather name="chevron-right" size={20} color={isDarkMode ? '#64748b' : '#94a3b8'} style={{ marginRight: 4 }} />
        </TouchableOpacity>

        {/* Item: Notificações */}
        <View style={styles.moduleItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.moduleIcon}>
              <Feather name="bell" size={20} color={isDarkMode ? '#cbd5e1' : '#334155'} />
            </View>
            <Text style={styles.moduleTitle}>Notificações</Text>
          </View>
          <Switch
            trackColor={{ false: '#334155', true: '#5849ff' }}
            thumbColor={notificationsEnabled ? '#fff' : '#94a3b8'}
            ios_backgroundColor="#334155"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
          />
        </View>

        {/* Item: Modo Escuro */}
        <View style={styles.moduleItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.moduleIcon}>
              <Feather name="moon" size={20} color={isDarkMode ? '#cbd5e1' : '#334155'} />
            </View>
            <Text style={styles.moduleTitle}>Modo Escuro</Text>
          </View>
          <Switch
            trackColor={{ false: '#334155', true: '#5849ff' }}
            thumbColor={isDarkMode ? '#fff' : '#94a3b8'}
            ios_backgroundColor="#334155"
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>

        {/* Item: Música de Fundo */}
        <View style={styles.moduleItem}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.moduleIcon}>
              <Feather name="music" size={20} color={isDarkMode ? '#cbd5e1' : '#334155'} />
            </View>
            <Text style={styles.moduleTitle}>Música de Fundo</Text>
          </View>
          <Switch
            trackColor={{ false: '#334155', true: '#5849ff' }}
            thumbColor={isMusicEnabled ? '#fff' : '#94a3b8'}
            ios_backgroundColor="#334155"
            onValueChange={toggleMusic}
            value={isMusicEnabled}
          />
        </View>

        {/* Item: Sair da Conta */}
        <TouchableOpacity
          style={styles.moduleItem}
          onPress={async () => {
            try {
              await AsyncStorage.removeItem('@intelectus_saved_token');
              const parentNav = navigation.getParent() || navigation;
              parentNav.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Erro ao sair da conta:', error);
            }
          }}
        >
          <View style={[styles.moduleIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Feather name="log-out" size={20} color="#ef4444" />
          </View>
          <Text style={[styles.moduleTitle, { color: '#ef4444' }]}>
            Sair da Conta
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Escolher/Mudar Foto de Perfil */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
            borderRadius: 20,
            padding: 24,
            width: '85%',
            borderWidth: 1,
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            alignItems: 'center'
          }}>
            <Text style={{ color: isDarkMode ? '#fff' : '#0f172a', fontSize: 20, fontWeight: '800', marginBottom: 16 }}>
              Mudar Foto de Perfil
            </Text>

            {/* Presets Grid */}
            <Text style={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 14, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 10 }}>
              Escolha um avatar
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              {PRESET_AVATARS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => selectPreset(preset.id)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderWidth: 2,
                    borderColor: avatarPreset === preset.id && !customAvatarUrl ? '#5849ff' : 'transparent',
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Feather name={preset.icon} size={24} color={preset.color} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom URL Input */}
            <Text style={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 14, fontWeight: '700', alignSelf: 'flex-start', marginBottom: 10 }}>
              Ou cole a URL da imagem
            </Text>
            <TextInput
              style={{
                width: '100%',
                backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9',
                borderWidth: 1.5,
                borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                borderRadius: 10,
                padding: 10,
                color: isDarkMode ? '#fff' : '#0f172a',
                fontSize: 14,
                marginBottom: 16
              }}
              placeholder="https://exemplo.com/foto.jpg"
              placeholderTextColor="#94a3b8"
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveCustomUrl}
                style={{
                  flex: 1,
                  backgroundColor: '#5849ff',
                  padding: 12,
                  borderRadius: 10,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Salvar URL</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ProfileTab;