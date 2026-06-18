import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator, Linking } from 'react-native';
import { darkStyles, lightStyles } from '../../styles/estilos';
import { useTheme } from '../../contexts/ThemeContext';
import { getBaseUrl } from '../../utils';
import { Ionicons } from '@expo/vector-icons';

const RoadmapScreen = ({ route, navigation }) => {
    const { isDarkMode } = useTheme();
    const styles = isDarkMode ? darkStyles : lightStyles;
    const { roadmap: initialRoadmap, uid } = route.params || {};
    const [roadmap, setRoadmap] = useState(initialRoadmap);
    const [selectedNode, setSelectedNode] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!roadmap && uid) {
            fetchUserRoadmap(uid);
        }
    }, [uid]);

    const fetchUserRoadmap = async (userId) => {
        setLoading(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/trilhas/usuario/${userId}`);
            const data = await response.json();
            if (data.success) setRoadmap(data.roadmap);
        } catch (err) {
            console.error("Erro ao buscar roadmap:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVideos = async (tema, nivel) => {
        setLoadingVideos(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/ia/videos?tema=${encodeURIComponent(tema)}&nivel=${encodeURIComponent(nivel || '')}`);
            const data = await response.json();
            if (data.success) setVideos(data.videos);
        } catch (err) {
            console.error("Erro ao buscar vídeos:", err);
        } finally {
            setLoadingVideos(false);
        }
    };

    const openNode = (node) => {
        if (node.status === 'locked') return;
        setSelectedNode(node);
        fetchVideos(node.label, roadmap?.level);
    };

    const toggleStatus = async (nodeId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'in-progress' : 'completed';
        setUpdating(true);
        try {
            const baseUrl = getBaseUrl();
            const response = await fetch(`${baseUrl}/api/trilhas/no/${nodeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, uid: uid || 'mock-uid' })
            });
            const data = await response.json();
            if (data.success) {
                setRoadmap(data.roadmap);
                if (selectedNode && selectedNode.id === nodeId) {
                    setSelectedNode({ ...selectedNode, status: newStatus });
                }
            }
        } catch (err) {
            console.error("Erro ao atualizar status:", err);
        } finally {
            setUpdating(false);
        }
    };

    const calculateProgress = () => {
        if (!roadmap?.nodes) return 0;
        const completed = roadmap.nodes.filter(n => n.status === 'completed').length;
        return (completed / roadmap.nodes.length) * 100;
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.mainContent}>
                <View style={[styles.header, { marginBottom: 12 }]}>
                    <TouchableOpacity onPress={() => navigation.navigate('Dashboard', { uid })} style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Voltar pra tela principal</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.greetingTitle}>{roadmap?.title || 'Sua Trilha'}</Text>
                    <Text style={styles.greetingSubtitle}>{roadmap?.description}</Text>
                    <View style={[styles.progressBarBackground, { marginTop: 12 }]}>
                        <View style={[styles.progressBarFill, { width: `${calculateProgress()}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{Math.round(calculateProgress())}% concluído</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {roadmap?.nodes?.map((node, idx) => (
                        <TouchableOpacity
                            key={node.id}
                            style={[
                                styles.roadmapCard,
                                { marginBottom: 12, borderLeftWidth: 4, borderLeftColor: node.status === 'completed' ? '#10b981' : node.status === 'in-progress' ? '#6366f1' : '#475569' },
                                node.status === 'locked' && { opacity: 0.6 }
                            ]}
                            onPress={() => openNode(node)}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}>MÓDULO {idx + 1}</Text>
                                {node.status === 'completed' && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
                            </View>
                            <Text style={[styles.roadmapTitle, { marginTop: 4 }]}>{node.label}</Text>
                            <Text style={styles.roadmapSubtitle} numberOfLines={2}>{node.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Modal de Detalhes do Módulo */}
            <Modal visible={selectedNode !== null} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: '#0f172a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: 'bold' }}>DETALHES DO MÓDULO</Text>
                                <Text style={[styles.greetingTitle, { fontSize: 22, marginTop: 4 }]}>{selectedNode?.label}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedNode(null)} style={styles.logoutButton}>
                                <Text style={styles.logoutButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.greetingSubtitle, { marginBottom: 24 }]}>{selectedNode?.description}</Text>

                        <Text style={[styles.sectionTitle, { fontSize: 16 }]}>CONTEÚDO RECOMENDADO</Text>

                        {loadingVideos ? (
                            <ActivityIndicator size="small" color="#6366f1" style={{ marginTop: 20 }} />
                        ) : (
                            <ScrollView style={{ flex: 1 }}>
                                {videos.map(video => (
                                    <TouchableOpacity
                                        key={video.id}
                                        style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: '#1e293b', borderRadius: 12, overflow: 'hidden' }}
                                        onPress={() => Linking.openURL(video.url)}
                                    >
                                        <Image source={{ uri: video.thumbnail }} style={{ width: 100, height: 60 }} />
                                        <View style={{ flex: 1, padding: 10 }}>
                                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }} numberOfLines={2}>{video.titulo}</Text>
                                            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{video.canal}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={[styles.button, { marginTop: 12, backgroundColor: selectedNode?.status === 'completed' ? '#1f2937' : '#5849ff' }]}
                            onPress={() => toggleStatus(selectedNode.id, selectedNode.status)}
                            disabled={updating}
                        >
                            {updating ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.buttonText}>
                                    {selectedNode?.status === 'completed' ? 'Marcar como não concluído' : 'Concluir Módulo'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RoadmapScreen;
