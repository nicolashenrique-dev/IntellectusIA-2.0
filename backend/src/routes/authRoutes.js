import express from 'express';
import { realizarLogin, registrarUsuario, solicitarRecuperacao, redefinirSenha } from '../controllers/authController.js';
import { obterPerfilUsuario } from '../controllers/profileController.js';

const router = express.Router();

// RF01 - Realizar Login / Cadastro
router.post('/login', realizarLogin);
router.post('/cadastro', registrarUsuario);

// RF02 - Perfil do usuário
router.get('/perfil/:uid', obterPerfilUsuario);

// RF03 & RF04 - Recuperação e Redefinição de Senha
router.post('/recuperar-senha', solicitarRecuperacao);
router.post('/resetar-senha', redefinirSenha);

export default router;
