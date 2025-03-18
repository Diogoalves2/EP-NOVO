"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Camara_1 = require("../models/Camara");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class AuthController {
    static async createSuperAdmin(req, res) {
        try {
            const { name, email, password } = req.body;
            // Verifica se já existe um super admin
            const existingSuperAdmin = await User_1.PostgresUserModel.findByRole('super_admin');
            if (existingSuperAdmin) {
                return res.status(400).json({ error: 'Super Admin já existe' });
            }
            // Cria o super admin
            const superAdmin = await User_1.PostgresUserModel.create({
                name,
                email,
                password,
                role: 'super_admin'
            });
            return res.status(201).json({
                id: superAdmin.id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: superAdmin.role
            });
        }
        catch (error) {
            console.error('Erro ao criar super admin:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            console.log(`Tentativa de login: ${email}`);
            // Busca o usuário pelo email
            const user = await User_1.PostgresUserModel.findByEmail(email);
            if (!user) {
                console.log(`Login falhou: usuário não encontrado para email ${email}`);
                return res.status(401).json({ error: 'Credenciais inválidas', detail: 'Email não registrado' });
            }
            console.log(`Usuário encontrado: ${user.name} (ID: ${user.id}, Role: ${user.role})`);
            // Verifica a senha
            const validPassword = await User_1.PostgresUserModel.verifyPassword(user, password);
            if (!validPassword) {
                console.log(`Login falhou: senha incorreta para ${email}`);
                return res.status(401).json({ error: 'Credenciais inválidas', detail: 'Senha incorreta' });
            }
            console.log(`Login bem-sucedido: ${user.name} (${user.email}), Role: ${user.role}`);
            // Gera o token JWT
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
            // Se for um vereador ou admin, busca os dados da câmara
            let camara = null;
            if ((user.role === 'vereador' || user.role === 'admin') && user.camara_id) {
                camara = await Camara_1.PostgresCamaraModel.findById(user.camara_id);
                console.log(`Dados da câmara recuperados: ${(camara === null || camara === void 0 ? void 0 : camara.nome) || 'N/A'} (ID: ${user.camara_id})`);
            }
            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    partido: user.partido,
                    cargo: user.cargo,
                    foto: user.foto,
                    camara_id: user.camara_id,
                    camara
                },
                token
            });
        }
        catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    static async refreshAccessToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Token não fornecido' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
            const user = await User_1.PostgresUserModel.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }
            const newToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
            return res.json({ token: newToken });
        }
        catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    }
    static async validateToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ error: 'Token não fornecido' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
            const user = await User_1.PostgresUserModel.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }
            return res.json({ valid: true });
        }
        catch (error) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    }
    static async logout(req, res) {
        // Como estamos usando JWT, não precisamos fazer nada no servidor
        // O cliente que deve descartar o token
        return res.status(200).json({ message: 'Logout realizado com sucesso' });
    }
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            // Verifica se o usuário já existe
            const existingUser = await User_1.PostgresUserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }
            // Cria o novo usuário
            const user = await User_1.PostgresUserModel.create({
                name,
                email,
                password,
                role: 'vereador'
            });
            // Remove a senha antes de enviar o usuário
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({ error: 'Erro ao registrar usuário' });
        }
    }
}
exports.AuthController = AuthController;
