import express from 'express';
import { realizarLogin, registrarUsuario, solicitarRecuperacao, resetarSenha, listarUsuarios } from '../controllers/authController.js';
import { obterPerfilUsuario } from '../controllers/profileController.js';

const router = express.Router();

// RF01 - Realizar Login / Cadastro
router.post('/login', realizarLogin);
router.post('/cadastro', registrarUsuario);

// Novo - Listagem de usuários (útil para desenvolvimento, testes e Swagger)
router.get('/usuarios', listarUsuarios);

// RF02 - Perfil do usuário
router.get('/perfil/:uid', obterPerfilUsuario);

// RF03 & RF04 - Recuperação e Redefinição de Senha
router.post('/recuperar-senha', solicitarRecuperacao);
router.post('/resetar-senha', resetarSenha);

export default router;
