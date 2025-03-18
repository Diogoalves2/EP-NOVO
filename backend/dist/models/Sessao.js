"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSessaoAssociations = exports.PostgresSessaoModel = void 0;
const database_1 = __importDefault(require("../database"));
class PostgresSessaoModel {
    static async findAll() {
        const result = await database_1.default.query('SELECT * FROM sessoes ORDER BY data DESC');
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM sessoes WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByCamaraId(camaraId) {
        const result = await database_1.default.query('SELECT * FROM sessoes WHERE camara_id = $1 ORDER BY data DESC', [camaraId]);
        return result.rows;
    }
    static async create(sessaoData) {
        const { titulo, descricao, data, tipo, status, camara_id } = sessaoData;
        const result = await database_1.default.query(`INSERT INTO sessoes (titulo, descricao, data, tipo, status, camara_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [titulo, descricao, data, tipo, status || 'agendada', camara_id]);
        return result.rows[0];
    }
    static async update(id, sessaoData) {
        const fields = Object.keys(sessaoData);
        if (fields.length === 0)
            return null;
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = Object.values(sessaoData);
        const query = `
      UPDATE sessoes
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
        const result = await database_1.default.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    static async delete(id) {
        var _a;
        const result = await database_1.default.query('DELETE FROM sessoes WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.PostgresSessaoModel = PostgresSessaoModel;
// Exporta a função de inicialização dos relacionamentos
const initSessaoAssociations = () => {
    // Os relacionamentos serão inicializados após todos os modelos serem definidos
    // Isso evita problemas de referência circular
};
exports.initSessaoAssociations = initSessaoAssociations;
