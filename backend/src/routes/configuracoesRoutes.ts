import { Router } from 'express';
import configuracoesController from '../controllers/configuracoesController';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Aplica o middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas
router.get('/', configuracoesController.index);
router.put('/', upload.single('logo'), configuracoesController.update);

export default router; 