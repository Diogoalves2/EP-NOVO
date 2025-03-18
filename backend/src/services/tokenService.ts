import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'chave_secreta_refresh_token';

interface TokenPayload {
  userId: string;
  role: string;
  email: string;
  name: string;
}

class TokenService {
  // Gerar token JWT principal (24 horas)
  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Gerar refresh token (7 dias)
  generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  // Verificar token JWT
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Verificar se o token está próximo da expiração (1 hora ou menos)
  isTokenNearExpiration(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      if (!decoded || !decoded.exp) return false;

      const expirationTime = decoded.exp * 1000; // Converter para milissegundos
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Retorna true se faltar 1 hora ou menos para expirar
      return timeUntilExpiration <= 3600000;
    } catch {
      return false;
    }
  }

  // Gerar novo par de tokens
  generateTokenPair(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    return {
      accessToken,
      refreshToken,
      refreshTokenExpires
    };
  }
}

export default new TokenService(); 