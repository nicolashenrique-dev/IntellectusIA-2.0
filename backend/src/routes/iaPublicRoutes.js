import express from 'express';
import { buscarVideosYoutube } from '../controllers/youtubeController.js';

const router = express.Router();

// ✅ Pública — busca vídeos do YouTube sem exigir autenticação
// Não acessa dados do usuário, apenas conteúdo externo
router.get('/videos', buscarVideosYoutube);

export default router;
