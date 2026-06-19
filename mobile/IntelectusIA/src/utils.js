import { Alert, Platform } from 'react-native';

export const getBaseUrl = () => {
    // API de produção indicada pelo usuário
    return 'https://backend-ten-ecru-93.vercel.app';
};

/**
 * Test connectivity to backend server
 * Useful for diagnostic purposes
 */
export const testBackendConnectivity = async () => {
    const baseUrl = getBaseUrl();
    console.log('🧪 [Diagnostic] Testing backend connectivity...');
    console.log('🔗 Base URL:', baseUrl);
    
    try {
        console.log('📍 Testing endpoint:', `${baseUrl}/health`);
        const response = await fetch(`${baseUrl}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Status:', response.status);
        const data = await response.json();
        console.log('📦 Response:', data);
        
        return {
            success: response.status === 200,
            status: response.status,
            data: data
        };
    } catch (error) {
        console.error('❌ Connectivity test failed:', error);
        console.error('   Error message:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
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
