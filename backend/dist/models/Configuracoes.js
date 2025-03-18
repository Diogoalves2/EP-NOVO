"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresConfiguracoesModel = void 0;
const database_1 = __importDefault(require("../database"));
class PostgresConfiguracoesModel {
    static async findAll() {
        const result = await database_1.default.query('SELECT * FROM configuracoes');
        return result.rows;
    }
    static async update(configData) {
        const fields = Object.keys(configData);
        if (fields.length === 0)
            return null;
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = Object.values(configData);
        const query = `
      UPDATE configuracoes
      SET ${setClause}, updated_at = NOW()
      RETURNING *
    `;
        const result = await database_1.default.query(query, values);
        return result.rows[0] || null;
    }
}
exports.PostgresConfiguracoesModel = PostgresConfiguracoesModel;
