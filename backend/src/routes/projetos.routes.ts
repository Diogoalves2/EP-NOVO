import { Router } from 'express';
import ProjetoController from '../controllers/ProjetoController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Comentando o middleware de autenticação temporariamente para testes
// router.use(authMiddleware);

// Rotas para projetos
router.get('/', ProjetoController.index);
router.post('/', ProjetoController.create);
router.get('/:id', ProjetoController.show);
router.put('/:id', ProjetoController.update);
router.delete('/:id', ProjetoController.delete);

export default router; 