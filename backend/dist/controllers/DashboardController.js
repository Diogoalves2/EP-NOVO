"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const database_1 = __importDefault(require("../database"));
class DashboardController {
    static async getStats(req, res) {
        try {
            // Buscar total de câmaras
            const camarasResult = await database_1.default.query('SELECT COUNT(*) as total FROM camaras');
            const totalCamaras = parseInt(camarasResult.rows[0].total);
            // Buscar total de votações em andamento
            const votacoesAndamentoResult = await database_1.default.query('SELECT COUNT(*) as total FROM votacoes WHERE status = $1', ['em_andamento']);
            const votacoesEmAndamento = parseInt(votacoesAndamentoResult.rows[0].total);
            // Buscar total de votações finalizadas
            const votacoesFinalizadasResult = await database_1.default.query('SELECT COUNT(*) as total FROM votacoes WHERE status = $1', ['finalizada']);
            const votacoesFinalizadas = parseInt(votacoesFinalizadasResult.rows[0].total);
            res.json({
                camaras_ativas: totalCamaras,
                votacoes_em_andamento: votacoesEmAndamento,
                votacoes_finalizadas: votacoesFinalizadas
            });
        }
        catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
        }
    }
}
exports.DashboardController = DashboardController;
