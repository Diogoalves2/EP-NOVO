"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Configuracoes_1 = require("../models/Configuracoes");
class ConfiguracoesController {
    async index(req, res) {
        try {
            const configuracoes = await Configuracoes_1.PostgresConfiguracoesModel.findAll();
            return res.json(configuracoes);
        }
        catch (error) {
            console.error('Erro ao buscar configurações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async update(req, res) {
        var _a;
        try {
            const { nome_camara, endereco, telefone, email } = req.body;
            const logo = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
            const configuracoes = await Configuracoes_1.PostgresConfiguracoesModel.update(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (nome_camara && { nome_camara })), (endereco && { endereco })), (telefone && { telefone })), (email && { email })), (logo && { logo })));
            if (!configuracoes) {
                return res.status(404).json({ error: 'Configurações não encontradas' });
            }
            return res.json(configuracoes);
        }
        catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.default = new ConfiguracoesController();
