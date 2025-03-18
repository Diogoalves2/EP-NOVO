"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sessao_1 = require("../models/Sessao");
const Camara_1 = require("../models/Camara");
class SessaoController {
    async index(req, res) {
        try {
            const { camara_id } = req.query;
            if (!camara_id) {
                return res.status(400).json({ error: 'ID da câmara é obrigatório' });
            }
            const sessoes = await Sessao_1.PostgresSessaoModel.findByCamaraId(Number(camara_id));
            return res.json(sessoes);
        }
        catch (error) {
            console.error('Erro ao listar sessões:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async create(req, res) {
        try {
            const { titulo, descricao, data, tipo, status, camara_id } = req.body;
            // Validações
            if (!titulo || !descricao || !data || !tipo || !camara_id) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }
            // Verifica se a câmara existe
            const camara = await Camara_1.PostgresCamaraModel.findById(Number(camara_id));
            if (!camara) {
                return res.status(404).json({ error: 'Câmara não encontrada' });
            }
            const sessao = await Sessao_1.PostgresSessaoModel.create({
                titulo,
                descricao,
                data,
                tipo,
                status: status || 'agendada',
                camara_id,
            });
            return res.status(201).json(sessao);
        }
        catch (error) {
            console.error('Erro ao criar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descricao, data, tipo, status } = req.body;
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            // Atualiza os campos
            const sessaoAtualizada = await Sessao_1.PostgresSessaoModel.update(Number(id), {
                titulo: titulo || sessao.titulo,
                descricao: descricao || sessao.descricao,
                data: data || sessao.data,
                tipo: tipo || sessao.tipo,
                status: status || sessao.status,
            });
            return res.json(sessaoAtualizada);
        }
        catch (error) {
            console.error('Erro ao atualizar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            await Sessao_1.PostgresSessaoModel.delete(Number(id));
            return res.status(204).send();
        }
        catch (error) {
            console.error('Erro ao excluir sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async show(req, res) {
        try {
            const { id } = req.params;
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            return res.json(sessao);
        }
        catch (error) {
            console.error('Erro ao buscar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // Método para iniciar uma sessão
    async iniciar(req, res) {
        try {
            const { id } = req.params;
            // Verificação de permissão
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Apenas administradores podem iniciar sessões'
                });
            }
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            if (sessao.status === 'em_andamento') {
                return res.status(400).json({ error: 'Esta sessão já está em andamento' });
            }
            if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
                return res.status(400).json({
                    error: 'Esta sessão já foi finalizada ou cancelada'
                });
            }
            // Atualiza o status da sessão para "em_andamento"
            const sessaoAtualizada = await Sessao_1.PostgresSessaoModel.update(Number(id), { status: 'em_andamento' });
            return res.json(sessaoAtualizada);
        }
        catch (error) {
            console.error('Erro ao iniciar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // Método para finalizar uma sessão
    async finalizar(req, res) {
        try {
            const { id } = req.params;
            // Verificação de permissão
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Apenas administradores podem finalizar sessões'
                });
            }
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            if (sessao.status !== 'em_andamento') {
                return res.status(400).json({
                    error: 'Apenas sessões em andamento podem ser finalizadas',
                    status_atual: sessao.status
                });
            }
            // Atualiza o status da sessão para "finalizada"
            const sessaoAtualizada = await Sessao_1.PostgresSessaoModel.update(Number(id), { status: 'finalizada' });
            return res.json(sessaoAtualizada);
        }
        catch (error) {
            console.error('Erro ao finalizar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // Método para cancelar uma sessão
    async cancelar(req, res) {
        try {
            const { id } = req.params;
            // Verificação de permissão
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Apenas administradores podem cancelar sessões'
                });
            }
            const sessao = await Sessao_1.PostgresSessaoModel.findById(Number(id));
            if (!sessao) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
                return res.status(400).json({
                    error: 'Esta sessão já foi finalizada ou cancelada'
                });
            }
            // Atualiza o status da sessão para "cancelada"
            const sessaoAtualizada = await Sessao_1.PostgresSessaoModel.update(Number(id), { status: 'cancelada' });
            return res.json(sessaoAtualizada);
        }
        catch (error) {
            console.error('Erro ao cancelar sessão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
// Exportar a instância
exports.default = new SessaoController();
