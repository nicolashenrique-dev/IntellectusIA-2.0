import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions, Alert } from 'react-native';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';
import { useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileTab from './ProfileTab';

const Principal = ({ navigation, route }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
  const [loading, setLoading] = useState(true);
  const [trilhaAtual, setTrilhaAtual] = useState(null);
  const [destaques, setDestaques] = useState([]); // CORRIGIDO: de destaQUES para destaques
  const [refreshing, setRefreshing] = useState(false);
  const [abaAtual, setAbaAtual] = useState('Home');

  // Usar o UID vindo do login ou mock
  const uid = route.params?.uid || 'mock-uid';

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = getBaseUrl();

      // Buscar trilha do usuário
      const resTrilha = await fetch(`${baseUrl}/api/trilhas/usuario/${uid}`);
      const dataTrilha = await resTrilha.json();
      if (dataTrilha.success) setTrilhaAtual(dataTrilha.roadmap);
      else setTrilhaAtual(null);

      // Buscar destaques
      const resDestaques = await fetch(`${baseUrl}/api/itens/destaques`);
      const dataDestaques = await resDestaques.json();
      if (dataDestaques.success) setDestaques(dataDestaques.destaques);

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const inscreverNaTrilha = async (nomeTrilha) => {
    Alert.alert(
      "Confirmar Inscrição",
      `Deseja se inscrever na trilha "${nomeTrilha}"? Se você já possui uma trilha ativa, ela será substituída.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              const baseUrl = getBaseUrl();
              const response = await fetch(`${baseUrl}/api/trilhas/inscrever`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, trilhaName: nomeTrilha })
              });
              const data = await response.json();
              if (data.success) {
                Alert.alert("Sucesso", `Inscrição na trilha "${nomeTrilha}" realizada com sucesso!`);
                fetchData();
              } else {
                Alert.alert("Erro", data.message || "Falha ao se inscrever na trilha.");
              }
            } catch (err) {
              console.error("Erro ao se inscrever na trilha:", err);
              Alert.alert("Erro", "Erro de conexão ao se inscrever na trilha.");
            }
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [uid])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const calculateProgress = (trilha) => {
    if (!trilha?.nodes) return 0;
    const completed = trilha.nodes.filter(n => n.status === 'completed').length;
    return Math.round((completed / trilha.nodes.length) * 100);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        contentContainerStyle={styles.mainContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
        showsVerticalScrollIndicator={false}
      >
        {abaAtual === 'Home' ? (
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greetingTitle}>Olá, Estudante!</Text>
                <Text style={styles.greetingSubtitle}>Pronto para continuar seus estudos?</Text>
              </View>
              <TouchableOpacity
                style={[styles.profileAvatar, { width: 48, height: 48, borderRadius: 24 }]}
                onPress={() => setAbaAtual('Profile')}
              >
                <Feather name="user" size={24} color="#818cf8" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sua Trilha Atual</Text>
                <Text style={styles.sectionSubtitle}>Acompanhe seu progresso e continue evoluindo.</Text>
              </View>

              {trilhaAtual ? (
                <TouchableOpacity
                  style={styles.roadmapCard}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Roadmap', { roadmap: trilhaAtual, uid })}
                >
                  <View style={styles.roadmapCardTopRow}>
                    <Text style={styles.roadmapBadge}>Em Andamento</Text>
                    <Text style={styles.roadmapProgressBadge}>{calculateProgress(trilhaAtual)}%</Text>
                  </View>
                  <Text style={styles.roadmapTitle}>{trilhaAtual.title}</Text>
                  <Text style={styles.roadmapSubtitle}>{trilhaAtual.description}</Text>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${calculateProgress(trilhaAtual)}%` }]} />
                  </View>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressText}>Progresso geral</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyStateCard}>
                  <Text style={styles.emptyStateTitle}>Nenhuma trilha ativa</Text>
                  <Text style={styles.emptyStateText}>Crie um roteiro de estudos personalizado com ajuda da nossa inteligência artificial para começar sua jornada.</Text>
                  <TouchableOpacity
                    style={styles.emptyStateButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Quiz', { uid })}
                  >
                    <Text style={styles.emptyStateButtonText}>+ Gerar Trilha com IA</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.section, { marginTop: 24 }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trilhas em Destaque</Text>
                <Text style={styles.sectionSubtitle}>Explore os roteiros mais acessados da plataforma.</Text>
              </View>

              {destaques.length > 0 ? (
                destaques.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.highlightCard}
                    activeOpacity={0.8}
                    onPress={() => inscreverNaTrilha(item.name)}
                  >
                    <View style={styles.highlightTopRow}>
                      <Text style={styles.highlightTitle}>{item.name}</Text>
                      <Text style={styles.highlightLevel}>{item.level}</Text>
                    </View>
                    <Text style={styles.highlightDescription}>Explore os principais fundamentos desta trilha para alavancar sua carreira.</Text>
                    <View style={styles.tagList}>
                      {item.tags?.map((tag, index) => (
                        <View key={index} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyListCard}>
                  <Text style={styles.emptyListTitle}>Nada por aqui ainda</Text>
                  <Text style={styles.emptyListText}>Novas trilhas serão adicionadas em breve.</Text>
                </View>
              )}
            </View>
          </View>
        ) : abaAtual === 'Profile' ? (
          <ProfileTab
            trilhaAtual={trilhaAtual}
            calculateProgress={calculateProgress}
            navigation={navigation}
          />
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PARTE DE BAIXO RESPONSIVA CONSERVADA */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.bottomTabItem} onPress={() => setAbaAtual('Home')}>
          <Feather name="home" size={24} color={abaAtual === 'Home' ? '#818cf8' : '#64748b'} />
          <Text style={[styles.bottomTabText, abaAtual === 'Home' && styles.bottomTabTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('Quiz', { uid })}>
          <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient colors={['#818cf8', '#4f46e5']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Feather name="plus" size={28} color="#fff" />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomTabItem} onPress={() => setAbaAtual('Profile')}>
          <Feather name="user" size={24} color={abaAtual === 'Profile' ? '#818cf8' : '#64748b'} />
          <Text style={[styles.bottomTabText, abaAtual === 'Profile' && styles.bottomTabTextActive]}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Principal;