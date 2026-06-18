import express from 'express';
import {
    gerarTrilha,
    obterTrilhaUsuario,
    obterTrilhaPorId,
    atualizarStatusNo
} from '../controllers/roadmapController.js';
import { listarDestaques } from '../controllers/itensController.js';

const router = express.Router();

// RF04 - Geração de Trilha Personalizada
router.post('/gerar', gerarTrilha);

// RF06 - Obter trilha do usuário
router.get('/usuario/:uid', obterTrilhaUsuario);

// Trilhas em destaque (Dashboard)
router.get('/destaques', listarDestaques);

// RF07 & RF08 - Visualização e Detalhe
router.get('/:id', obterTrilhaPorId);

// RF09 - Status de Conclusão
router.patch('/no/:id', atualizarStatusNo);

export default router;
