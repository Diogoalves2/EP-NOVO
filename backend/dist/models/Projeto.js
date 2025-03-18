"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresProjetoModel = exports.StatusProjeto = void 0;
const database_1 = __importDefault(require("../database"));
var StatusProjeto;
(function (StatusProjeto) {
    StatusProjeto["APRESENTADO"] = "apresentado";
    StatusProjeto["EM_VOTACAO"] = "em_votacao";
    StatusProjeto["APROVADO"] = "aprovado";
    StatusProjeto["REJEITADO"] = "rejeitado";
})(StatusProjeto || (exports.StatusProjeto = StatusProjeto = {}));
class PostgresProjetoModel {
    static async findAll() {
        const result = await database_1.default.query('SELECT * FROM projetos ORDER BY created_at DESC');
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM projetos WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByCamaraId(camaraId) {
        const result = await database_1.default.query('SELECT * FROM projetos WHERE camara_id = $1 ORDER BY created_at DESC', [camaraId]);
        return result.rows;
    }
    static async findBySessaoId(sessaoId) {
        const result = await database_1.default.query('SELECT * FROM projetos WHERE sessao_id = $1 ORDER BY created_at DESC', [sessaoId]);
        return result.rows;
    }
    static async create(projetoData) {
        try {
            console.log('Criando projeto com dados:', projetoData);
            const { titulo, descricao, autor, status, data_apresentacao, sessao_id, camara_id } = projetoData;
            const result = await database_1.default.query(`INSERT INTO projetos (titulo, descricao, autor, status, data_apresentacao, sessao_id, camara_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`, [titulo, descricao, autor, status || 'apresentado', data_apresentacao || new Date(), sessao_id, camara_id]);
            console.log('Projeto criado com sucesso:', result.rows[0]);
            return result.rows[0];
        }
        catch (error) {
            console.error('Erro ao criar projeto no model:', error);
            throw error;
        }
    }
    static async update(id, projetoData) {
        const fields = Object.keys(projetoData);
        if (fields.length === 0)
            return null;
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = Object.values(projetoData);
        const query = `
      UPDATE projetos
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
        const result = await database_1.default.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    static async delete(id) {
        var _a;
        const result = await database_1.default.query('DELETE FROM projetos WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.PostgresProjetoModel = PostgresProjetoModel;
