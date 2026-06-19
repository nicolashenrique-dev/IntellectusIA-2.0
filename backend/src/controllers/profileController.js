import { adminDb } from '../config/firebase.js';
import { MOCK_USERS } from '../config/mockDb.js';

export const obterPerfilUsuario = async (req, res) => {
    try {
        const { uid } = req.params;
        let perfilData = null;

        if (adminDb) {
            try {
                const docUsuario = await adminDb.collection('users').doc(uid).get();
                if (docUsuario.exists) {
                    perfilData = docUsuario.data();
                }
            } catch (error) {
                console.error('Erro ao acessar Firestore:', error);
            }
        }

        if (!perfilData) {
            // Tenta encontrar o usuário na lista em memória (Modo Mock)
            const userInMock = MOCK_USERS.find(u => u.uid === uid);
            if (userInMock) {
                perfilData = userInMock;
            } else {
                // Fallback dinâmico para desenvolvimento local
                perfilData = {
                    uid,
                    nome: uid === 'mock-user-uid' ? 'Usuário (Mock)' : `Usuário ${uid}`,
                    email: uid === 'mock-user-uid' ? 'admin@intelectus.com' : `${uid}@intelectus.com`,
                    createdAt: new Date().toISOString()
                };
            }
        }

        return res.status(200).json({ success: true, profile: perfilData });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }
};
