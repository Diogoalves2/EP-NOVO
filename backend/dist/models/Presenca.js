"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresPresencaModel = void 0;
const database_1 = __importDefault(require("../database"));
class PostgresPresencaModel {
    static async findBySessaoId(sessaoId) {
        const result = await database_1.default.query(`
      SELECT p.*, u.name, u.partido, u.foto 
      FROM presencas p
      JOIN users u ON p.vereador_id = u.id
      WHERE p.sessao_id = $1
      ORDER BY u.name ASC
    `, [sessaoId]);
        return result.rows.map(row => (Object.assign(Object.assign({}, row), { vereador: {
                name: row.name,
                partido: row.partido,
                foto: row.foto
            } })));
    }
    static async findByVereadorAndSessao(vereadorId, sessaoId) {
        const result = await database_1.default.query('SELECT * FROM presencas WHERE vereador_id = $1 AND sessao_id = $2', [vereadorId, sessaoId]);
        return result.rows[0] || null;
    }
    static async findPresentesBySessionId(sessaoId) {
        const result = await database_1.default.query(`
      SELECT p.*, u.name, u.partido, u.foto 
      FROM presencas p
      JOIN users u ON p.vereador_id = u.id
      WHERE p.sessao_id = $1 AND p.presente = true
      ORDER BY u.name ASC
    `, [sessaoId]);
        return result.rows.map(row => (Object.assign(Object.assign({}, row), { vereador: {
                name: row.name,
                partido: row.partido,
                foto: row.foto
            } })));
    }
    static async registrarPresenca(sessaoId, vereadorId, presente) {
        const existingPresenca = await this.findByVereadorAndSessao(vereadorId, sessaoId);
        if (existingPresenca) {
            // Atualiza presença existente
            const result = await database_1.default.query('UPDATE presencas SET presente = $1, hora_registro = NOW() WHERE sessao_id = $2 AND vereador_id = $3 RETURNING *', [presente, sessaoId, vereadorId]);
            return result.rows[0];
        }
        else {
            // Cria nova presença
            const result = await database_1.default.query('INSERT INTO presencas (sessao_id, vereador_id, presente) VALUES ($1, $2, $3) RETURNING *', [sessaoId, vereadorId, presente]);
            return result.rows[0];
        }
    }
    static async marcarTodosPresentes(sessaoId) {
        // Buscar todos os vereadores da câmara associada à sessão
        const sessaoResult = await database_1.default.query('SELECT camara_id FROM sessoes WHERE id = $1', [sessaoId]);
        if (sessaoResult.rows.length === 0) {
            throw new Error('Sessão não encontrada');
        }
        const camaraId = sessaoResult.rows[0].camara_id;
        // Buscar vereadores da câmara
        const vereadoresResult = await database_1.default.query('SELECT id FROM users WHERE camara_id = $1 AND role = $2', [camaraId, 'vereador']);
        if (vereadoresResult.rows.length === 0) {
            return 0;
        }
        // Registrar presença para cada vereador
        let countInserted = 0;
        for (const vereador of vereadoresResult.rows) {
            await this.registrarPresenca(sessaoId, vereador.id, true);
            countInserted++;
        }
        return countInserted;
    }
    static async marcarTodosAusentes(sessaoId) {
        const result = await database_1.default.query('UPDATE presencas SET presente = false WHERE sessao_id = $1 RETURNING *', [sessaoId]);
        return result.rowCount || 0;
    }
    static async verificarPresenca(vereadorId, sessaoId) {
        const presenca = await this.findByVereadorAndSessao(vereadorId, sessaoId);
        return presenca ? presenca.presente : false;
    }
    static async contarPresencas(sessaoId) {
        const result = await database_1.default.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN presente = true THEN 1 ELSE 0 END) as presentes,
        SUM(CASE WHEN presente = false THEN 1 ELSE 0 END) as ausentes
      FROM presencas
      WHERE sessao_id = $1
    `, [sessaoId]);
        return {
            total: parseInt(result.rows[0].total) || 0,
            presentes: parseInt(result.rows[0].presentes) || 0,
            ausentes: parseInt(result.rows[0].ausentes) || 0
        };
    }
}
exports.PostgresPresencaModel = PostgresPresencaModel;
