import React, { createContext, useState, useEffect, useContext } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AudioContext = createContext();

// URL de uma música instrumental suave e livre de direitos autorais para som de fundo
const MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const AudioProvider = ({ children }) => {
    const [isMusicEnabled, setIsMusicEnabled] = useState(true);

    // Carregar preferência salva de música ao iniciar
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const val = await AsyncStorage.getItem('@intelectus_music_enabled');
                if (val === 'false') {
                    setIsMusicEnabled(false);
                }
            } catch (error) {
                console.error('Erro ao ler preferência de música:', error);
            }
        };
        loadSettings();
    }, []);

    // Monitorar e controlar a inicialização/finalização do áudio
    useEffect(() => {
        let isMounted = true;
        let loadedSound = null;

        const manageAudio = async () => {
            if (isMusicEnabled) {
                try {
                    // Configurar a reprodução de áudio
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                        staysActiveInBackground: true,
                    });

                    // Carregar e reproduzir
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: MUSIC_URL },
                        { shouldPlay: true, isLooping: true, volume: 0.15 } // Volume suave para segundo plano
                    );

                    loadedSound = sound;

                    if (!isMounted) {
                        // Se desmontou no meio do caminho, limpa
                        await sound.unloadAsync();
                    }
                } catch (error) {
                    console.warn('Erro ao reproduzir áudio em segundo plano:', error);
                }
            }
        };

        manageAudio();

        return () => {
            isMounted = false;
            if (loadedSound) {
                loadedSound.unloadAsync().catch(() => {});
            }
        };
    }, [isMusicEnabled]);

    const toggleMusic = async () => {
        try {
            const nextState = !isMusicEnabled;
            setIsMusicEnabled(nextState);
            await AsyncStorage.setItem('@intelectus_music_enabled', nextState ? 'true' : 'false');
        } catch (error) {
            console.error('Erro ao alternar música:', error);
        }
    };

    return (
        <AudioContext.Provider value={{ isMusicEnabled, toggleMusic }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
