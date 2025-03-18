import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PostgresUserModel } from '../models/User';

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

// Definir o tipo extendido de Request para incluir o user e userId
interface RequestWithUser extends Request {
  userId?: number;
  user?: TokenPayload;
}

export default async function authMiddleware(
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [scheme, token] = authHeader.split(' ');

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Verifica se o usuário ainda existe
    const user = await PostgresUserModel.findById(Number(decoded.id));
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Adiciona as informações do usuário à requisição
    req.userId = decoded.id;
    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
} 