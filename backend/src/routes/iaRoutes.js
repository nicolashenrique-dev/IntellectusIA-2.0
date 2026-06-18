import express from 'express';
const router = express.Router();

import { recomendarTrilha } from '../controllers/iaController.js';
import { buscarVideosYoutube } from '../controllers/youtubeController.js';

// Rota de Recomendação com Ollama IA
router.post('/recomendar', recomendarTrilha);

// Rota de Busca de Vídeos no YouTube
router.get('/videos', buscarVideosYoutube);

export default router;
