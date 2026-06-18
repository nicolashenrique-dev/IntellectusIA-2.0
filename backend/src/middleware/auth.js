import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'intelectusia-super-secret-key';

/**
 * Middleware de autenticação via JWT.
 * Verifica o token Bearer no header Authorization.
 */
export const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token de autenticação não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Disponibiliza os dados do usuário nas rotas
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expirado. Faça login novamente.' });
        }
        return res.status(403).json({ success: false, message: 'Token inválido.' });
    }
};
