"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Voto_1 = require("../models/Voto");
const Projeto_1 = require("../models/Projeto");
const database_1 = __importDefault(require("../database"));
class VotoController {
    async listarVotos(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID do projeto é obrigatório' });
            }
            const votos = await Voto_1.PostgresVotoModel.findByProjetoId(Number(id));
            return res.json(votos);
        }
        catch (error) {
            console.error('Erro ao listar votos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async contarVotos(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID do projeto é obrigatório' });
            }
            const contagem = await Voto_1.PostgresVotoModel.contarVotos(Number(id));
            return res.json(contagem);
        }
        catch (error) {
            console.error('Erro ao contar votos:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async registrarVoto(req, res) {
        var _a;
        // Começando uma transação para garantir atomicidade
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const { projeto_id } = req.params;
            const { tipo_voto } = req.body;
            const vereador_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Obtém o ID do usuário autenticado
            if (!vereador_id) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!projeto_id || !tipo_voto) {
                return res.status(400).json({ error: 'ID do projeto e tipo de voto são obrigatórios' });
            }
            // Verificar se o tipo de voto é válido
            if (!Object.values(Voto_1.TipoVoto).includes(tipo_voto)) {
                return res.status(400).json({ error: 'Tipo de voto inválido' });
            }
            // Verificar se o projeto existe e está em votação
            const projeto = await Projeto_1.PostgresProjetoModel.findById(Number(projeto_id));
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            if (projeto.status !== Projeto_1.StatusProjeto.EM_VOTACAO) {
                return res.status(400).json({ error: 'Este projeto não está em votação' });
            }
            // Verificar se o vereador já votou neste projeto
            const votoExistente = await Voto_1.PostgresVotoModel.findByVereadorAndProjeto(vereador_id, Number(projeto_id));
            if (votoExistente) {
                return res.status(400).json({ error: 'Você já votou neste projeto' });
            }
            // Registrar o voto
            const voto = await Voto_1.PostgresVotoModel.create({
                projeto_id: Number(projeto_id),
                vereador_id,
                tipo_voto: tipo_voto
            });
            await client.query('COMMIT');
            return res.status(201).json(voto);
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao registrar voto:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        finally {
            client.release();
        }
    }
    async iniciarVotacao(req, res) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const { projeto_id } = req.params;
            const usuario = req.user;
            if (!usuario || usuario.role !== 'admin') {
                return res.status(403).json({ error: 'Apenas administradores podem iniciar votações' });
            }
            // Verificar se o projeto existe
            const projeto = await Projeto_1.PostgresProjetoModel.findById(Number(projeto_id));
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            // Verificar se o projeto já está em votação ou finalizado
            if (projeto.status === Projeto_1.StatusProjeto.EM_VOTACAO) {
                return res.status(400).json({ error: 'Este projeto já está em votação' });
            }
            if (projeto.status === Projeto_1.StatusProjeto.APROVADO || projeto.status === Projeto_1.StatusProjeto.REJEITADO) {
                return res.status(400).json({ error: 'Este projeto já foi votado' });
            }
            // Verificar se a sessão está em andamento
            const sessaoQuery = await client.query('SELECT status FROM sessoes WHERE id = $1', [projeto.sessao_id]);
            if (sessaoQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            const sessaoStatus = sessaoQuery.rows[0].status;
            if (sessaoStatus !== 'em_andamento') {
                return res.status(400).json({
                    error: 'Só é possível iniciar votação quando a sessão estiver em andamento',
                    status_atual: sessaoStatus
                });
            }
            // Atualizar o status do projeto para "em_votacao"
            const projetoAtualizado = await Projeto_1.PostgresProjetoModel.update(Number(projeto_id), {
                status: Projeto_1.StatusProjeto.EM_VOTACAO
            });
            await client.query('COMMIT');
            return res.json(projetoAtualizado);
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao iniciar votação:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        finally {
            client.release();
        }
    }
    async finalizarVotacao(req, res) {
        const client = await database_1.default.connect();
        try {
            await client.query('BEGIN');
            const { projeto_id } = req.params;
            const usuario = req.user;
            if (!usuario || usuario.role !== 'admin') {
                return res.status(403).json({ error: 'Apenas administradores podem finalizar votações' });
            }
            // Verificar se o projeto existe e está em votação
            const projeto = await Projeto_1.PostgresProjetoModel.findById(Number(projeto_id));
            if (!projeto) {
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }
            if (projeto.status !== Projeto_1.StatusProjeto.EM_VOTACAO) {
                return res.status(400).json({ error: 'Este projeto não está em votação' });
            }
            // Contar os votos
            const contagem = await Voto_1.PostgresVotoModel.contarVotos(Number(projeto_id));
            // Determinar o resultado
            let novoStatus;
            if (contagem.sim > contagem.nao) {
                novoStatus = Projeto_1.StatusProjeto.APROVADO;
            }
            else {
                novoStatus = Projeto_1.StatusProjeto.REJEITADO;
            }
            // Atualizar o status do projeto
            const projetoAtualizado = await Projeto_1.PostgresProjetoModel.update(Number(projeto_id), {
                status: novoStatus
            });
            await client.query('COMMIT');
            return res.json({
                projeto: projetoAtualizado,
                resultado: {
                    status: novoStatus,
                    contagem
                }
            });
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao finalizar votação:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        finally {
            client.release();
        }
    }
}
// Exportar a instância
exports.default = new VotoController();
