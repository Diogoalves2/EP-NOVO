import { Router } from 'express';
import authRoutes from './authRoutes';
import camaraRoutes from './camaraRoutes';
import configuracoesRoutes from './configuracoesRoutes';
import dashboardRoutes from './dashboardRoutes';
import usersRoutes from './users';
import sessoesRoutes from './sessoes';
import projetosRoutes from './projetos.routes';
import votoRoutes from './votosRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/camaras', camaraRoutes);
router.use('/configuracoes', configuracoesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/sessoes', sessoesRoutes);
router.use('/projetos', projetosRoutes);
router.use('/votos', votoRoutes);

export default router; 