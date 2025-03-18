"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Presenca_1 = require("../models/Presenca");
class PresencaController {
    /**
     * Lista todas as presenças de uma sessão
     */
    async listarPresencasPorSessao(req, res) {
        try {
            const { sessaoId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            const presencas = await Presenca_1.PostgresPresencaModel.findBySessaoId(Number(sessaoId));
            return res.status(200).json(presencas);
        }
        catch (error) {
            console.error('Erro ao listar presenças:', error);
            return res.status(500).json({ error: 'Erro ao listar presenças' });
        }
    }
    /**
     * Lista apenas vereadores presentes em uma sessão
     */
    async listarPresentes(req, res) {
        try {
            const { sessaoId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            const presentes = await Presenca_1.PostgresPresencaModel.findPresentesBySessionId(Number(sessaoId));
            return res.status(200).json(presentes);
        }
        catch (error) {
            console.error('Erro ao listar vereadores presentes:', error);
            return res.status(500).json({ error: 'Erro ao listar vereadores presentes' });
        }
    }
    /**
     * Registra a presença ou ausência de um vereador
     */
    async registrarPresenca(req, res) {
        try {
            const { sessaoId, vereadorId } = req.params;
            const { presente } = req.body;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            if (!vereadorId || isNaN(Number(vereadorId))) {
                return res.status(400).json({ error: 'ID do vereador inválido' });
            }
            if (presente === undefined) {
                return res.status(400).json({ error: 'O status de presença é obrigatório' });
            }
            const presenca = await Presenca_1.PostgresPresencaModel.registrarPresenca(Number(sessaoId), Number(vereadorId), Boolean(presente));
            return res.status(200).json(presenca);
        }
        catch (error) {
            console.error('Erro ao registrar presença:', error);
            return res.status(500).json({ error: 'Erro ao registrar presença' });
        }
    }
    /**
     * Marca todos os vereadores de uma câmara como presentes em uma sessão
     */
    async marcarTodosPresentes(req, res) {
        try {
            const { sessaoId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            const totalMarcados = await Presenca_1.PostgresPresencaModel.marcarTodosPresentes(Number(sessaoId));
            return res.status(200).json({
                message: `${totalMarcados} vereadores marcados como presentes`,
                totalMarcados
            });
        }
        catch (error) {
            console.error('Erro ao marcar todos como presentes:', error);
            return res.status(500).json({ error: 'Erro ao marcar todos como presentes' });
        }
    }
    /**
     * Marca todos os vereadores como ausentes em uma sessão
     */
    async marcarTodosAusentes(req, res) {
        try {
            const { sessaoId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            const totalMarcados = await Presenca_1.PostgresPresencaModel.marcarTodosAusentes(Number(sessaoId));
            return res.status(200).json({
                message: `${totalMarcados} vereadores marcados como ausentes`,
                totalMarcados
            });
        }
        catch (error) {
            console.error('Erro ao marcar todos como ausentes:', error);
            return res.status(500).json({ error: 'Erro ao marcar todos como ausentes' });
        }
    }
    /**
     * Verifica se um vereador está presente em uma sessão
     */
    async verificarPresenca(req, res) {
        try {
            const { sessaoId, vereadorId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            if (!vereadorId || isNaN(Number(vereadorId))) {
                return res.status(400).json({ error: 'ID do vereador inválido' });
            }
            const estaPresente = await Presenca_1.PostgresPresencaModel.verificarPresenca(Number(vereadorId), Number(sessaoId));
            return res.status(200).json({ presente: estaPresente });
        }
        catch (error) {
            console.error('Erro ao verificar presença:', error);
            return res.status(500).json({ error: 'Erro ao verificar presença' });
        }
    }
    /**
     * Retorna estatísticas sobre presenças na sessão
     */
    async contarPresencas(req, res) {
        try {
            const { sessaoId } = req.params;
            if (!sessaoId || isNaN(Number(sessaoId))) {
                return res.status(400).json({ error: 'ID da sessão inválido' });
            }
            const contagem = await Presenca_1.PostgresPresencaModel.contarPresencas(Number(sessaoId));
            return res.status(200).json(contagem);
        }
        catch (error) {
            console.error('Erro ao contar presenças:', error);
            return res.status(500).json({ error: 'Erro ao contar presenças' });
        }
    }
}
// Exportar uma instância em vez da classe
exports.default = new PresencaController();
