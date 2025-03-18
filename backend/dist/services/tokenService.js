"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'chave_secreta_refresh_token';
class TokenService {
    // Gerar token JWT principal (24 horas)
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user._id,
            role: user.role,
            email: user.email,
            name: user.name
        }, JWT_SECRET, { expiresIn: '24h' });
    }
    // Gerar refresh token (7 dias)
    generateRefreshToken() {
        return crypto_1.default.randomBytes(40).toString('hex');
    }
    // Verificar token JWT
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    // Verificar se o token está próximo da expiração (1 hora ou menos)
    isTokenNearExpiration(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.exp)
                return false;
            const expirationTime = decoded.exp * 1000; // Converter para milissegundos
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            // Retorna true se faltar 1 hora ou menos para expirar
            return timeUntilExpiration <= 3600000;
        }
        catch (_a) {
            return false;
        }
    }
    // Gerar novo par de tokens
    generateTokenPair(user) {
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
exports.default = new TokenService();
