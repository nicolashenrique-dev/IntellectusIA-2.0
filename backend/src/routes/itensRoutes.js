import express from 'express';
import { listarItens, listarDestaques } from '../controllers/itensController.js';

const router = express.Router();

router.get('/', listarItens);
router.get('/destaques', listarDestaques);

export default router;
