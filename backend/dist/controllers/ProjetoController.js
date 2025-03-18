"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Projeto_1 = require("../models/Projeto");
class ProjetoController {
    async index(req, res) {
        try {
            const { camara_id, sessao_id } = req.query;
            if (camara_id) {
                const projetos = await Projeto_1.PostgresProjetoModel.findByCamaraId(Number(camara_id));
                return res.json(projetos);
            }
            else if (sessao_id) {
                const projetos = await Projeto_1.PostgresProjetoModel.findBySessaoId(Number(sessao_id));
                return res.json(projetos);
            }
            else {
                const projetos = await Projeto_1.PostgresProjetoModel.findAll();
                return res.json(projetos);
            }
        }
        catch (error) {
            console.error('Erro ao listar projetos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async show(req, res) {
        try {
            const { id } = req.params;
            const projeto = await Projeto_1.PostgresProjetoModel.findById(Number(id));
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            return res.json(projeto);
        }
        catch (error) {
            console.error('Erro ao buscar projeto:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async create(req, res) {
        try {
            console.log('Recebendo requisição para criar projeto:', req.body);
            const { titulo, descricao, autor, status, data_apresentacao, sessao_id, camara_id } = req.body;
            // Validar campos obrigatórios
            if (!titulo || !descricao || !autor || !sessao_id || !camara_id) {
                return res.status(400).json({
                    error: 'Campos obrigatórios faltando',
                    details: 'Os campos título, descrição, autor, sessao_id e camara_id são obrigatórios'
                });
            }
            const projeto = await Projeto_1.PostgresProjetoModel.create({
                titulo,
                descricao,
                autor,
                status,
                data_apresentacao: data_apresentacao || new Date(),
                sessao_id: Number(sessao_id),
                camara_id: Number(camara_id)
            });
            return res.status(201).json(projeto);
        }
        catch (error) {
            console.error('Erro ao criar projeto:', error);
            return res.status(500).json({
                error: 'Erro ao criar projeto',
                details: error.message
            });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descricao, autor, status, data_apresentacao } = req.body;
            // Verificar se o projeto existe
            const existingProjeto = await Projeto_1.PostgresProjetoModel.findById(Number(id));
            if (!existingProjeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            // Atualizar o projeto
            const projeto = await Projeto_1.PostgresProjetoModel.update(Number(id), Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (titulo && { titulo })), (descricao && { descricao })), (autor && { autor })), (status && { status })), (data_apresentacao && { data_apresentacao })));
            if (!projeto) {
                return res.status(500).json({ error: 'Erro ao atualizar projeto' });
            }
            return res.json(projeto);
        }
        catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Projeto_1.PostgresProjetoModel.delete(Number(id));
            if (!deleted) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            return res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao excluir projeto:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
// Exportar a instância
exports.default = new ProjetoController();
