import { roadmapOwner } from '../middleware/roadmapOwner.js';
import express from 'express';
import { obterPerfilUsuario } from '../controllers/profileController.js';
import { obterRanking, obterPontosUsuario } from '../controllers/roadmapController.js';
import roadmapRoutes from './roadmapRoutes.js';
import iaRoutes from './iaRoutes.js';
import itensRoutes from './itensRoutes.js';

const router = express.Router();

router.get('/perfil/:uid', roadmapOwner, obterPerfilUsuario);
router.get('/ranking', obterRanking);
router.get('/pontos/:uid', roadmapOwner, obterPontosUsuario);

router.use('/trilhas', roadmapRoutes);
router.use('/ia', iaRoutes);
router.use('/itens', itensRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
