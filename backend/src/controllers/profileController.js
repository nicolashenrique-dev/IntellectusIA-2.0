import { adminDb } from '../config/firebase.js';

export const obterPerfilUsuario = async (req, res) => {
    try {
        const { uid } = req.params;
        const docUsuario = await adminDb.collection('users').doc(uid).get();

        if (!docUsuario.exists) {
            return res.status(404).json({ success: false, message: 'Perfil não encontrado' });
        }

        res.status(200).json({ success: true, profile: docUsuario.data() });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar perfil' });
    }
};
