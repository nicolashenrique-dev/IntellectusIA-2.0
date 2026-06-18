import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'intelectusia-super-secret-key';

export const realizarLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // Para desenvolvimento/teste inicial, aceitamos o admin clássico com BCrypt simulado ou real
        // Em um sistema real, buscaríamos no Banco de Dados aqui.

        // Mock flexível para desenvolvimento: aceita admin oficial OU qualquer email para testes
        if (email.includes('@')) {
            const isMatch = (email === 'admin@intelectus.com') ? await bcrypt.compare(password, await bcrypt.hash('123456', 10)) : true;

            if (isMatch) {
                const token = jwt.sign({ email, uid: 'mock-user-uid' }, JWT_SECRET, { expiresIn: '7d' });
                return res.status(200).json({
                    success: true,
                    token,
                    user: { email, nome: 'Usuário (Mock)', uid: 'mock-user-uid' }
                });
            }
        }

        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
};

export const registrarUsuario = async (req, res) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // No futuro, aqui salvamos no Firestore
        // console.log(`Salvando no BD: ${email} com senha hashada: ${hashedPassword}`);

        return res.status(201).json({
            success: true,
            message: 'Usuário registrado com segurança utilizando encriptação.',
            user: { nome, email, uid: `node-uid-${Date.now()}` }
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ success: false, message: 'Erro ao processar registro' });
    }
};
