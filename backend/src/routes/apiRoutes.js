import express from 'express';
import { realizarLogin, registrarUsuario, solicitarRecuperacao, redefinirSenha } from '../controllers/authController.js';
import { obterPerfilUsuario } from '../controllers/profileController.js';
import roadmapRoutes from './roadmapRoutes.js';
import iaRoutes from './iaRoutes.js';
import itensRoutes from './itensRoutes.js';

const router = express.Router();

router.post('/login', realizarLogin);
router.post('/cadastro', registrarUsuario);
router.post('/recuperar-senha', solicitarRecuperacao);
router.post('/resetar-senha', redefinirSenha);
router.get('/perfil/:uid', obterPerfilUsuario);

router.use('/trilhas', roadmapRoutes);
router.use('/ia', iaRoutes);
router.use('/itens', itensRoutes);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
