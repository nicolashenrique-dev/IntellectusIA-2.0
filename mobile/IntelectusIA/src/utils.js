import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';

export const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        const url = new URL(process.env.EXPO_PUBLIC_API_URL);
        if (!['http:', 'https:'].includes(url.protocol) || (!__DEV__ && url.protocol !== 'https:')) {
            throw new Error('Configure uma URL HTTPS para a API em produção.');
        }
        return url.toString().replace(/\/$/, '');
    }
    if (__DEV__) {
        const host = Constants.expoConfig?.hostUri?.split(':')[0];
        return `http://${host || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost')}:3000`;
    }
    return 'https://backend-ten-ecru-93.vercel.app';
};

export const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        const msg = message ? `${title}: ${message}` : title;
        window.alert(msg);
    } else {
        Alert.alert(title, message);
    }
};

export const showConfirm = (title, message, onConfirm, onCancel) => {
    if (Platform.OS === 'web') {
        const msg = message ? `${title}\n\n${message}` : title;
        const confirmed = window.confirm(msg);
        if (confirmed) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    } else {
        Alert.alert(
            title,
            message,
            [
                { text: "Cancelar", style: "cancel", onPress: onCancel },
                { text: "Confirmar", onPress: onConfirm }
            ]
        );
    }
};
