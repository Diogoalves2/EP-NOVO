import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Rotas públicas
router.post('/login', authController.AuthController.login);
router.post('/refresh-token', authController.AuthController.refreshAccessToken);
router.post('/validate-token', authController.AuthController.validateToken);

// Rotas protegidas
router.post('/create-super-admin', authMiddleware, authController.AuthController.createSuperAdmin);
router.post('/logout', authMiddleware, authController.AuthController.logout);
router.post('/register', authController.AuthController.register);

export default router; 