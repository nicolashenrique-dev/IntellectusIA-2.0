import jwt from 'jsonwebtoken';
import { admin, adminDb } from '../config/firebase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intelectusia-super-secret-key';

/**
 * Middleware de autenticação via JWT.
 * Suporta dois formatos de token:
 *   1. JWT interno (gerado pelo /autenticacao/login do Node)
 *   2. Firebase ID Token (gerado pelo Firebase Auth no frontend)
 */
export const autenticarToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });
    }

    // 1. Tentar verificar como JWT interno primeiro (mais rápido, sem rede)
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (internalErr) {
        // Se falhou, pode ser um Firebase Token — tentar verificar via Admin SDK
    }

    // 2. Tentar verificar como Firebase ID Token
    if (admin.apps.length) {
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            req.user = { uid: decoded.uid, email: decoded.email };
            return next();
        } catch (firebaseErr) {
            return res.status(403).json({ success: false, message: 'Token inválido.' });
        }
    }

    // 3. Modo Mock: sem Firebase Admin disponível, extrair payload sem verificar assinatura
    // (apenas para desenvolvimento local — NÃO usar em produção)
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.uid || payload.user_id || payload.sub) {
            req.user = { uid: payload.uid || payload.user_id || payload.sub, email: payload.email };
            return next();
        }
    } catch (_) {}

    return res.status(403).json({ success: false, message: 'Token inválido ou não verificável em modo mock.' });
};
