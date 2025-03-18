"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresVotoModel = exports.TipoVoto = void 0;
const database_1 = __importDefault(require("../database"));
var TipoVoto;
(function (TipoVoto) {
    TipoVoto["SIM"] = "sim";
    TipoVoto["NAO"] = "nao";
    TipoVoto["ABSTER"] = "abster";
})(TipoVoto || (exports.TipoVoto = TipoVoto = {}));
class PostgresVotoModel {
    static async findByProjetoId(projetoId) {
        const result = await database_1.default.query('SELECT * FROM votos WHERE projeto_id = $1 ORDER BY created_at ASC', [projetoId]);
        return result.rows;
    }
    static async findByVereadorAndProjeto(vereadorId, projetoId) {
        const result = await database_1.default.query('SELECT * FROM votos WHERE vereador_id = $1 AND projeto_id = $2', [vereadorId, projetoId]);
        return result.rows[0] || null;
    }
    static async create(votoData) {
        const { projeto_id, vereador_id, tipo_voto } = votoData;
        const result = await database_1.default.query(`INSERT INTO votos (projeto_id, vereador_id, tipo_voto)
       VALUES ($1, $2, $3)
       RETURNING *`, [projeto_id, vereador_id, tipo_voto]);
        return result.rows[0];
    }
    static async contarVotos(projetoId) {
        const result = await database_1.default.query(`SELECT 
        COUNT(CASE WHEN tipo_voto = 'sim' THEN 1 END) as sim,
        COUNT(CASE WHEN tipo_voto = 'nao' THEN 1 END) as nao,
        COUNT(CASE WHEN tipo_voto = 'abster' THEN 1 END) as abster
       FROM votos 
       WHERE projeto_id = $1`, [projetoId]);
        return result.rows[0];
    }
    static async excluirVotosDeUmProjeto(projetoId) {
        var _a;
        const result = await database_1.default.query('DELETE FROM votos WHERE projeto_id = $1', [projetoId]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    }
}
exports.PostgresVotoModel = PostgresVotoModel;
