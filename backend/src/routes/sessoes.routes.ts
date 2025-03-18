import { Router } from 'express';
import SessaoController from '../controllers/SessaoController';
import { authMiddleware } from '../middlewares/auth';

const sessoesRouter = Router();

// Aplica o middleware de autenticação em todas as rotas
sessoesRouter.use(authMiddleware);

// Rotas
sessoesRouter.get('/', SessaoController.index);
sessoesRouter.post('/', SessaoController.create);
sessoesRouter.get('/:id', SessaoController.show);
sessoesRouter.put('/:id', SessaoController.update);
sessoesRouter.delete('/:id', SessaoController.delete);

export default sessoesRouter; 