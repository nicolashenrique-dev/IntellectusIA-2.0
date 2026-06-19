import { Alert, Platform } from 'react-native';

export const getBaseUrl = () => {
    // Nova API de produção na Vercel
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
