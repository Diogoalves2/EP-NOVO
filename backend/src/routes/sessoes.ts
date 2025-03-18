import { Router } from 'express';
import sessoesController from '../controllers/sessoesController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas
router.get('/', sessoesController.index);
router.post('/', sessoesController.create);
router.get('/:id', sessoesController.show);
router.put('/:id', sessoesController.update);
router.delete('/:id', sessoesController.delete);

// Novas rotas para controle de status da sessão
router.post('/:id/iniciar', sessoesController.iniciar);
router.post('/:id/finalizar', sessoesController.finalizar);
router.post('/:id/cancelar', sessoesController.cancelar);

export default router; 