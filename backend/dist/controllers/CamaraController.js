"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamaraController = void 0;
const Camara_1 = require("../models/Camara");
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pg_1 = require("pg");
const pool = new pg_1.Pool();
class CamaraController {
    static async index(req, res) {
        try {
            const camaras = await Camara_1.PostgresCamaraModel.findAll();
            res.json(camaras);
        }
        catch (error) {
            console.error('Erro ao listar câmaras:', error);
            res.status(500).json({ error: 'Erro ao listar câmaras' });
        }
    }
    static async show(req, res) {
        try {
            const id = parseInt(req.params.id);
            const camara = await Camara_1.PostgresCamaraModel.findById(id);
            if (!camara) {
                return res.status(404).json({ error: 'Câmara não encontrada' });
            }
            res.json(camara);
        }
        catch (error) {
            console.error('Erro ao buscar câmara:', error);
            res.status(500).json({ error: 'Erro ao buscar câmara' });
        }
    }
    static async create(req, res) {
        var _a, _b, _c, _d;
        try {
            console.log('Corpo da requisição:', req.body);
            console.log('Arquivos recebidos:', req.files);
            const files = req.files;
            const { nome, endereco, cidade, estado, cep, telefone, email, site } = req.body;
            const vereadores = JSON.parse(req.body.vereadores);
            // Validar campos obrigatórios
            if (!nome || !endereco || !cidade || !estado || !cep || !telefone || !email) {
                return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
            }
            if (!((_a = files === null || files === void 0 ? void 0 : files.logo) === null || _a === void 0 ? void 0 : _a[0])) {
                return res.status(400).json({ error: 'O logo da câmara é obrigatório' });
            }
            if (!((_b = files === null || files === void 0 ? void 0 : files.regimentoInterno) === null || _b === void 0 ? void 0 : _b[0])) {
                return res.status(400).json({ error: 'O regimento interno é obrigatório' });
            }
            // Verificar se existe um vereador com cargo "Presidente"
            const presidenteIndex = vereadores.findIndex((v) => v.cargo && v.cargo.toLowerCase() === 'presidente');
            // Validar que apenas um vereador tenha o cargo de Presidente
            let numPresidentes = 0;
            vereadores.forEach((v) => {
                if (v.cargo && v.cargo.toLowerCase() === 'presidente') {
                    numPresidentes++;
                }
            });
            if (numPresidentes > 1) {
                return res.status(400).json({
                    error: 'Apenas um vereador pode ter o cargo de Presidente'
                });
            }
            // Criar a câmara
            const camara = await Camara_1.PostgresCamaraModel.create({
                nome,
                endereco,
                cidade,
                estado,
                cep,
                telefone,
                email,
                site: site || null,
                logo: files.logo[0].filename,
                regimento_interno: files.regimentoInterno[0].filename
            });
            // Criar os vereadores
            for (const vereador of vereadores) {
                const fotoField = `foto_vereador_${vereadores.indexOf(vereador)}`;
                const foto = (_d = (_c = files[fotoField]) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.filename;
                // Hash da senha
                const hashedPassword = await bcrypt_1.default.hash(vereador.senha, 10);
                // Verificar se este vereador é o presidente (possui cargo de "Presidente")
                const isPresidente = vereador.cargo && vereador.cargo.toLowerCase() === 'presidente';
                await User_1.PostgresUserModel.create({
                    name: vereador.nome,
                    email: vereador.email,
                    password: hashedPassword,
                    role: isPresidente ? 'admin' : 'vereador', // O presidente recebe o papel de admin
                    partido: vereador.partido,
                    cargo: vereador.cargo,
                    foto: foto || null,
                    camara_id: camara.id
                });
            }
            // Garante que o vereador com cargo 'Presidente' seja admin
            const presidente = await pool.query('SELECT id FROM users WHERE camara_id = $1 AND LOWER(cargo) = $2', [camara.id, 'presidente']);
            if (presidente.rows.length > 0) {
                // Atualiza o vereador presidente para ser admin
                await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', presidente.rows[0].id]);
                console.log(`Vereador com ID ${presidente.rows[0].id} definido como admin por ser Presidente da Câmara`);
            }
            res.status(201).json(camara);
        }
        catch (error) {
            console.error('Erro ao criar câmara:', error);
            // Se houver arquivos enviados, tenta removê-los em caso de erro
            if (req.files) {
                const files = req.files;
                Object.values(files).flat().forEach(file => {
                    const filePath = path_1.default.join(__dirname, '../../uploads', file.filename);
                    try {
                        fs_1.default.unlinkSync(filePath);
                    }
                    catch (unlinkError) {
                        console.error('Erro ao remover arquivo:', unlinkError);
                    }
                });
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Erro ao criar câmara' });
            }
        }
    }
    static async update(req, res) {
        var _a, _b;
        try {
            console.log('Iniciando atualização da câmara');
            console.log('Corpo da requisição:', req.body);
            console.log('Arquivos recebidos:', req.files);
            const id = parseInt(req.params.id);
            const files = req.files;
            const { nome, endereco, cidade, estado, cep, telefone, email, site } = req.body;
            // Validar campos obrigatórios
            if (!nome || !endereco || !cidade || !estado || !cep || !telefone || !email) {
                return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
            }
            // Busca a câmara existente
            const existingCamara = await Camara_1.PostgresCamaraModel.findById(id);
            if (!existingCamara) {
                return res.status(404).json({ error: 'Câmara não encontrada' });
            }
            // Prepara os dados para atualização
            const updateData = {
                nome,
                endereco,
                cidade,
                estado,
                cep,
                telefone,
                email,
                site: site || null
            };
            // Atualiza os arquivos se fornecidos
            if ((_a = files === null || files === void 0 ? void 0 : files.logo) === null || _a === void 0 ? void 0 : _a[0]) {
                // Remove o logo antigo
                if (existingCamara.logo) {
                    const oldLogoPath = path_1.default.join(__dirname, '../../uploads', existingCamara.logo);
                    try {
                        fs_1.default.unlinkSync(oldLogoPath);
                        console.log('Logo antigo removido:', oldLogoPath);
                    }
                    catch (error) {
                        console.error('Erro ao remover logo antigo:', error);
                    }
                }
                updateData.logo = files.logo[0].filename;
                console.log('Novo logo:', files.logo[0].filename);
            }
            if ((_b = files === null || files === void 0 ? void 0 : files.regimentoInterno) === null || _b === void 0 ? void 0 : _b[0]) {
                // Remove o regimento antigo
                if (existingCamara.regimento_interno) {
                    const oldRegimentoPath = path_1.default.join(__dirname, '../../uploads', existingCamara.regimento_interno);
                    try {
                        fs_1.default.unlinkSync(oldRegimentoPath);
                        console.log('Regimento antigo removido:', oldRegimentoPath);
                    }
                    catch (error) {
                        console.error('Erro ao remover regimento antigo:', error);
                    }
                }
                updateData.regimento_interno = files.regimentoInterno[0].filename;
                console.log('Novo regimento:', files.regimentoInterno[0].filename);
            }
            console.log('Dados para atualização:', updateData);
            // Atualiza a câmara
            const updatedCamara = await Camara_1.PostgresCamaraModel.update(id, updateData);
            if (!updatedCamara) {
                return res.status(404).json({ error: 'Erro ao atualizar câmara' });
            }
            console.log('Câmara atualizada com sucesso:', updatedCamara);
            res.json(updatedCamara);
        }
        catch (error) {
            console.error('Erro ao atualizar câmara:', error);
            // Se houver arquivos enviados e ocorrer um erro, remove-os
            if (req.files) {
                const files = req.files;
                Object.values(files).flat().forEach(file => {
                    const filePath = path_1.default.join(__dirname, '../../uploads', file.filename);
                    try {
                        fs_1.default.unlinkSync(filePath);
                        console.log('Arquivo removido após erro:', filePath);
                    }
                    catch (unlinkError) {
                        console.error('Erro ao remover arquivo:', unlinkError);
                    }
                });
            }
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Erro ao atualizar câmara' });
            }
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            // Busca a câmara antes de deletar
            const camara = await Camara_1.PostgresCamaraModel.findById(id);
            if (!camara) {
                return res.status(404).json({ error: 'Câmara não encontrada' });
            }
            // Remove os arquivos da câmara
            if (camara.logo) {
                const logoPath = path_1.default.join(__dirname, '../../uploads', camara.logo);
                try {
                    fs_1.default.unlinkSync(logoPath);
                }
                catch (error) {
                    console.error('Erro ao remover logo:', error);
                }
            }
            if (camara.regimento_interno) {
                const regimentoPath = path_1.default.join(__dirname, '../../uploads', camara.regimento_interno);
                try {
                    fs_1.default.unlinkSync(regimentoPath);
                }
                catch (error) {
                    console.error('Erro ao remover regimento:', error);
                }
            }
            // Deleta a câmara
            const deleted = await Camara_1.PostgresCamaraModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ error: 'Câmara não encontrada' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao deletar câmara:', error);
            res.status(500).json({ error: 'Erro ao deletar câmara' });
        }
    }
}
exports.CamaraController = CamaraController;
