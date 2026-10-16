import express from 'express';

const router = express.Router();

import { recomendarTrilha } from '../controllers/iaController.js';
import { buscarVideosYoutube } from '../controllers/youtubeController.js';

// Rota de Recomendação com Gemini IA (protegida)
router.post('/recomendar', recomendarTrilha);

// The public /ia/videos alias is mounted separately in app.js.
router.get('/videos', buscarVideosYoutube);

export default router;
