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
exports.UserController = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../database"));
class UserController {
    static async index(req, res) {
        try {
            const { camara_id } = req.query;
            let users;
            if (camara_id) {
                users = await User_1.PostgresUserModel.findByCamaraId(Number(camara_id));
            }
            else {
                users = await User_1.PostgresUserModel.findAll();
            }
            // Remove a senha dos usuários antes de enviar
            const usersWithoutPassword = users.map(user => {
                const { password } = user, userWithoutPassword = __rest(user, ["password"]);
                return userWithoutPassword;
            });
            res.json(usersWithoutPassword);
        }
        catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }
    static async show(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = await User_1.PostgresUserModel.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            // Remove a senha antes de enviar
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            res.json(userWithoutPassword);
        }
        catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar usuário' });
        }
    }
    static async create(req, res) {
        var _a;
        try {
            console.log('Corpo da requisição:', req.body);
            console.log('Arquivo recebido:', req.file);
            const { nome, email, senha, partido, cargo, camara_id } = req.body;
            // Validar campos obrigatórios
            if (!nome || !email || !senha || !partido || !cargo || !camara_id) {
                return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
            }
            // Verificar se o email já está em uso
            const existingUser = await User_1.PostgresUserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Este e-mail já está em uso' });
            }
            // Hash da senha
            const hashedPassword = await bcrypt_1.default.hash(senha, 10);
            // Criar o usuário
            const user = await User_1.PostgresUserModel.create({
                name: nome,
                email,
                password: hashedPassword,
                role: 'vereador',
                partido,
                cargo,
                foto: ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || null,
                camara_id: parseInt(camara_id)
            });
            // Remove a senha antes de enviar
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            console.error('Erro ao criar usuário:', error);
            // Se houver arquivo enviado, tenta removê-lo em caso de erro
            if (req.file) {
                const filePath = path_1.default.join(__dirname, '../../uploads', req.file.filename);
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (unlinkError) {
                    console.error('Erro ao remover arquivo:', unlinkError);
                }
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar usuário' });
            }
        }
    }
    static async update(req, res) {
        var _a;
        try {
            console.log('Iniciando atualização do usuário');
            console.log('Corpo da requisição:', req.body);
            console.log('Arquivo recebido:', req.file);
            const id = parseInt(req.params.id);
            const { nome, email, senha, partido, cargo, camara_id } = req.body;
            // Busca o usuário existente
            const existingUser = await User_1.PostgresUserModel.findById(id);
            if (!existingUser) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            // Verifica se o novo email já está em uso por outro usuário
            if (email && email !== existingUser.email) {
                const userWithEmail = await User_1.PostgresUserModel.findByEmail(email);
                if (userWithEmail && userWithEmail.id !== id) {
                    return res.status(400).json({ error: 'Este e-mail já está em uso' });
                }
            }
            // Prepara os dados para atualização
            const updateData = {};
            if (nome)
                updateData.name = nome;
            if (email)
                updateData.email = email;
            if (senha)
                updateData.password = await bcrypt_1.default.hash(senha, 10);
            if (partido)
                updateData.partido = partido;
            if (cargo)
                updateData.cargo = cargo;
            if (camara_id)
                updateData.camara_id = parseInt(camara_id);
            // Verificar se o usuário está se tornando presidente
            const isBecomingPresident = cargo &&
                cargo.toLowerCase() === 'presidente' &&
                ((_a = existingUser.cargo) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'presidente';
            // Se o usuário está se tornando presidente
            if (isBecomingPresident) {
                console.log('Usuário está se tornando presidente');
                updateData.role = 'admin';
                // Revogar o papel de admin de qualquer outro usuário na mesma câmara
                const camaraId = camara_id ? parseInt(camara_id) : existingUser.camara_id;
                if (camaraId) {
                    console.log(`Revogando permissões de admin de outros usuários na câmara ${camaraId}`);
                    await database_1.default.query(`UPDATE users SET role = 'vereador' 
             WHERE camara_id = $1 AND id != $2 AND role = 'admin'`, [camaraId, id]);
                }
            }
            // Atualiza a foto se fornecida
            if (req.file) {
                // Remove a foto antiga
                if (existingUser.foto) {
                    const oldFotoPath = path_1.default.join(__dirname, '../../uploads', existingUser.foto);
                    try {
                        fs_1.default.unlinkSync(oldFotoPath);
                        console.log('Foto antiga removida:', oldFotoPath);
                    }
                    catch (error) {
                        console.error('Erro ao remover foto antiga:', error);
                    }
                }
                updateData.foto = req.file.filename;
                console.log('Nova foto:', req.file.filename);
            }
            // Atualiza o usuário
            const updatedUser = await User_1.PostgresUserModel.update(id, updateData);
            if (!updatedUser) {
                return res.status(404).json({ error: 'Erro ao atualizar usuário' });
            }
            // Verificar se o usuário foi definido como presidente
            if (req.body.cargo && req.body.cargo.toLowerCase() === 'presidente') {
                // Obter o ID da câmara do usuário
                const camaraResult = await database_1.default.query('SELECT camara_id FROM users WHERE id = $1', [id]);
                if (camaraResult.rows.length > 0) {
                    const camaraId = camaraResult.rows[0].camara_id;
                    // Remover o papel admin de qualquer outro usuário da mesma câmara
                    await database_1.default.query('UPDATE users SET role = $1 WHERE camara_id = $2 AND id != $3 AND role = $4', ['vereador', camaraId, id, 'admin']);
                    // Definir este usuário como admin
                    await database_1.default.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', id]);
                    console.log(`Usuário ${id} promovido a admin por ser definido como Presidente`);
                }
            }
            // Remove a senha antes de enviar
            const { password } = updatedUser, userWithoutPassword = __rest(updatedUser, ["password"]);
            res.json(userWithoutPassword);
        }
        catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            // Se houver arquivo enviado e ocorrer um erro, remove-o
            if (req.file) {
                const filePath = path_1.default.join(__dirname, '../../uploads', req.file.filename);
                try {
                    fs_1.default.unlinkSync(filePath);
                    console.log('Arquivo removido após erro:', filePath);
                }
                catch (unlinkError) {
                    console.error('Erro ao remover arquivo:', unlinkError);
                }
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar usuário' });
            }
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            // Busca o usuário antes de deletar
            const user = await User_1.PostgresUserModel.findById(id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            // Remove a foto do usuário
            if (user.foto) {
                const fotoPath = path_1.default.join(__dirname, '../../uploads', user.foto);
                try {
                    fs_1.default.unlinkSync(fotoPath);
                }
                catch (error) {
                    console.error('Erro ao remover foto:', error);
                }
            }
            // Deleta o usuário
            const deleted = await User_1.PostgresUserModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
}
exports.UserController = UserController;
