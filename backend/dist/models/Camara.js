"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresCamaraModel = void 0;
const database_1 = __importDefault(require("../database"));
class PostgresCamaraModel {
    static async findAll() {
        const result = await database_1.default.query('SELECT * FROM camaras ORDER BY nome');
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM camaras WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(camara) {
        const { nome, endereco, cidade, estado, cep, telefone, email, site, logo, regimento_interno } = camara;
        const result = await database_1.default.query(`INSERT INTO camaras (
        nome, endereco, cidade, estado, cep, telefone, email,
        site, logo, regimento_interno
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`, [nome, endereco, cidade, estado, cep, telefone, email,
            site, logo, regimento_interno]);
        return result.rows[0];
    }
    static async update(id, camara) {
        // Primeiro, verifica se a câmara existe
        const exists = await this.findById(id);
        if (!exists)
            return null;
        // Constrói a query dinamicamente baseada nos campos fornecidos
        const fields = Object.keys(camara).filter(key => camara[key] !== undefined);
        if (fields.length === 0)
            return exists;
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = fields.map(field => camara[field]);
        const query = `
      UPDATE camaras
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
        const result = await database_1.default.query(query, [...values, id]);
        return result.rows[0];
    }
    static async delete(id) {
        var _a;
        const result = await database_1.default.query('DELETE FROM camaras WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.PostgresCamaraModel = PostgresCamaraModel;
