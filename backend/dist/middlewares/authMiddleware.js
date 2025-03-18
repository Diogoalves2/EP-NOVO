"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
async function authMiddleware(req, res, next) {
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
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Verifica se o usuário ainda existe
        const user = await User_1.PostgresUserModel.findById(Number(decoded.id));
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        // Adiciona as informações do usuário à requisição
        req.userId = decoded.id;
        req.user = decoded;
        return next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
