import express from 'express';
import { autenticarToken } from '../middleware/auth.js';
const router = express.Router();

import { recomendarTrilha } from '../controllers/iaController.js';
import { buscarVideosYoutube } from '../controllers/youtubeController.js';

// Rota de Recomendação com Gemini IA (protegida)
router.post('/recomendar', autenticarToken, recomendarTrilha);

// Rota de Busca de Vídeos no YouTube (pública — não acessa dados do usuário)
router.get('/videos', buscarVideosYoutube);

export default router;
