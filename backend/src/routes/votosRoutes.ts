import { Router } from 'express';
import VotoController from '../controllers/VotoController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Rotas públicas para visualização dos votos
router.get('/projetos/:projeto_id/votos', VotoController.listarVotos);
router.get('/projetos/:projeto_id/contagem-votos', VotoController.contarVotos);

// Rotas protegidas que exigem autenticação
router.use(authMiddleware);

// Rota para registrar um voto (apenas vereadores autenticados)
router.post('/projetos/:projeto_id/votos', VotoController.registrarVoto);

// Rotas para controle de votação (apenas admin)
router.post('/projetos/:projeto_id/iniciar-votacao', VotoController.iniciarVotacao);
router.post('/projetos/:projeto_id/finalizar-votacao', VotoController.finalizarVotacao);

export default router; 