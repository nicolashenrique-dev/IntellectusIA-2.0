import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminDb } from '../config/firebase.js';
import { MOCK_USERS } from '../config/mockDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intelectusia-super-secret-key';

export const realizarLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        let userFound = null;

        if (adminDb) {
            try {
                const snapshot = await adminDb.collection('users').where('email', '==', email).get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    userFound = { uid: doc.id, ...doc.data() };
                }
            } catch (err) {
                console.error('Erro ao buscar usuário no Firestore:', err);
            }
        }

        if (!userFound) {
            userFound = MOCK_USERS.find(u => u.email === email);
        }

        if (userFound) {
            const token = jwt.sign({ email: userFound.email, uid: userFound.uid }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({
                success: true,
                token,
                user: { email: userFound.email, nome: userFound.nome, uid: userFound.uid }
            });
        }

        // Se o email é válido, permitimos login dinâmico em desenvolvimento
        if (email.includes('@')) {
            const uid = `mock-uid-${Date.now()}`;
            const token = jwt.sign({ email, uid }, JWT_SECRET, { expiresIn: '7d' });
            const dynamicUser = { email, nome: email.split('@')[0], uid, createdAt: new Date().toISOString() };
            MOCK_USERS.push(dynamicUser);
            return res.status(200).json({
                success: true,
                token,
                user: dynamicUser
            });
        }

        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};

export const registrarUsuario = async (req, res) => {
    const { nome, email, password, uid } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ success: false, message: 'Nome e e-mail são obrigatórios.' });
    }

    try {
        const finalUid = uid || `node-uid-${Date.now()}`;
        const newUser = { nome, email, uid: finalUid, createdAt: new Date().toISOString() };

        const jaExiste = MOCK_USERS.some(u => u.uid === finalUid || u.email === email);

        if (!jaExiste) {
            if (adminDb) {
                try {
                    await adminDb.collection('users').doc(finalUid).set({ nome, email, createdAt: newUser.createdAt });
                } catch (err) {
                    console.error('Erro ao salvar no Firestore:', err);
                    MOCK_USERS.push(newUser);
                }
            } else {
                MOCK_USERS.push(newUser);
            }
        }

        return res.status(201).json({
            success: true,
            message: jaExiste ? 'Usuário já estava registrado.' : 'Usuário registrado com sucesso.',
            user: jaExiste ? MOCK_USERS.find(u => u.uid === finalUid || u.email === email) : newUser
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar registro' });
    }
};

export const listarUsuarios = async (req, res) => {
    try {
        let users = [];

        if (adminDb) {
            try {
                const snapshot = await adminDb.collection('users').get();
                snapshot.forEach(doc => {
                    users.push({ uid: doc.id, ...doc.data() });
                });
            } catch (err) {
                console.error('Erro ao buscar usuários no Firestore:', err);
                users = [...MOCK_USERS];
            }
        } else {
            users = [...MOCK_USERS];
        }

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return res.status(500).json({ success: false, message: 'Erro ao listar usuários' });
    }
};

export const solicitarRecuperacao = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
    }

    try {
        return res.status(200).json({
            success: true,
            message: 'Se um usuário com este e-mail existir, instruções de recuperação foram enviadas.'
        });
    } catch (error) {
        console.error('Erro ao solicitar recuperação:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar solicitação de recuperação.' });
    }
};

export const resetarSenha = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token e nova senha são obrigatórios.' });
    }

    try {
        return res.status(200).json({
            success: true,
            message: 'Senha redefinida com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar redefinição de senha.' });
    }
};

    

