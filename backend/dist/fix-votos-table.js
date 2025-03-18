"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'camaras_db',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: Number(process.env.POSTGRES_PORT || 5432),
});
async function fixVotosTable() {
    const client = await pool.connect();
    try {
        console.log('Conectado ao PostgreSQL com sucesso!');
        // Lê o arquivo de correção
        const filePath = path.join(__dirname, 'database', 'migrations', 'fix_votos_table.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        // Executa a correção
        console.log('Executando correção da tabela de votos...');
        await client.query(sql);
        console.log('Correção executada com sucesso!');
        // Verifica a estrutura da tabela após a correção
        console.log('Estrutura da tabela votos após correção:');
        const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'votos'
      ORDER BY ordinal_position;
    `);
        console.table(schema.rows);
        // Verifica as constraints
        console.log('Restrições da tabela votos:');
        const constraints = await client.query(`
      SELECT conname as constraint_name, contype as constraint_type
      FROM pg_constraint 
      WHERE conrelid = 'votos'::regclass;
    `);
        console.table(constraints.rows);
    }
    catch (err) {
        console.error('Erro ao corrigir tabela votos:', err);
    }
    finally {
        client.release();
        await pool.end();
    }
}
fixVotosTable();
