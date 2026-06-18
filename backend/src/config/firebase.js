import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let adminDb = null;

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'intelectusai';
    let credential = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } catch (error) {
            console.error('FIREBASE_SERVICE_ACCOUNT inválido ou ausente. Usando modo mock.');
        }
    }

    if (credential) {
        try {
            admin.initializeApp({
                credential,
                projectId
            });
            adminDb = admin.firestore();
        } catch (error) {
            console.error('Erro ao inicializar Firebase Admin:', error);
        }
    } else {
        console.warn('Firebase Admin não inicializado. Endpoints de banco real falharão (Modo Mock).');
    }
} else {
    adminDb = admin.firestore();
}

export { admin, adminDb };
export default admin;
