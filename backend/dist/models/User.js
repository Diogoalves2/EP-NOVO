"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserModel = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = __importDefault(require("../database"));
class PostgresUserModel {
    static async findAll() {
        const result = await database_1.default.query('SELECT * FROM users ORDER BY name');
        return result.rows;
    }
    static async findById(id) {
        const result = await database_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByEmail(email) {
        const result = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async findByRole(role) {
        const result = await database_1.default.query('SELECT * FROM users WHERE role = $1', [role]);
        return result.rows[0] || null;
    }
    static async findByCamaraId(camaraId) {
        const result = await database_1.default.query('SELECT * FROM users WHERE camara_id = $1 ORDER BY name', [camaraId]);
        return result.rows;
    }
    static async create(data) {
        const { name, email, password, role, partido, cargo, foto, camara_id } = data;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const result = await database_1.default.query(`INSERT INTO users (name, email, password, role, partido, cargo, foto, camara_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [name, email, hashedPassword, role, partido, cargo, foto, camara_id]);
        return result.rows[0];
    }
    static async update(id, data) {
        const fields = Object.keys(data);
        if (fields.length === 0)
            return null;
        if (data.password) {
            data.password = await bcrypt_1.default.hash(data.password, 10);
        }
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = Object.values(data);
        const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;
        const result = await database_1.default.query(query, [...values, id]);
        return result.rows[0] || null;
    }
    static async delete(id) {
        var _a;
        const result = await database_1.default.query('DELETE FROM users WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
    static async verifyPassword(user, password) {
        return bcrypt_1.default.compare(password, user.password);
    }
    static async query(text, params) {
        const result = await database_1.default.query(text, params);
        return result;
    }
}
exports.PostgresUserModel = PostgresUserModel;
