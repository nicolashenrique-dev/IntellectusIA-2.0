import { roadmapOwner } from '../middleware/roadmapOwner.js';
import express from 'express';
import {
  gerarTrilha,
  obterTrilhaUsuario,
  obterTrilhaPorId,
  atualizarStatusNo,
  inscreverTrilha,
  obterRanking,
  obterPontosUsuario,
} from '../controllers/roadmapController.js';
import { listarDestaques } from '../controllers/itensController.js';

const router = express.Router();

// RF04 - Geração de Trilha Personalizada
router.post('/gerar', roadmapOwner, gerarTrilha);

// Inscrição em trilha pré-programada (destaque)
router.post('/inscrever', roadmapOwner, inscreverTrilha);

// Ranking geral de pontuação
router.get('/ranking', obterRanking);

// Pontuação e nível do usuário
router.get('/pontos/:uid', roadmapOwner, obterPontosUsuario);

// RF06 - Obter trilha do usuário
router.get('/usuario/:uid', roadmapOwner, obterTrilhaUsuario);

// Trilhas em destaque (Dashboard)
router.get('/destaques', listarDestaques);

// RF07 & RF08 - Visualização e Detalhe
router.get('/:id', obterTrilhaPorId);

// RF09 - Status de Conclusão e Pontuação
router.patch('/no/:id', roadmapOwner, atualizarStatusNo);

export default router;
