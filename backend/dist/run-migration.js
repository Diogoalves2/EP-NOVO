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
async function runVotosMigration() {
    const client = await pool.connect();
    try {
        console.log('Conectado ao PostgreSQL com sucesso!');
        console.log(`Banco de dados: ${process.env.POSTGRES_DB}`);
        // Lê o arquivo de migração
        const filePath = path.join(__dirname, 'database', 'migrations', '999_create_votos_table.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        // Executa a migração
        console.log('Executando migração para criar tabela de votos...');
        await client.query(sql);
        console.log('Migração executada com sucesso!');
        // Verifica se a tabela foi criada
        const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'votos'
      );
    `);
        if (result.rows[0].exists) {
            console.log('Tabela "votos" existe no banco de dados!');
            // Verificar a estrutura da tabela
            console.log('Estrutura da tabela votos:');
            const schema = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'votos'
        ORDER BY ordinal_position;
      `);
            console.table(schema.rows);
        }
        else {
            console.log('Atenção: A tabela "votos" não foi encontrada no banco de dados.');
        }
    }
    catch (err) {
        console.error('Erro ao executar migração:', err);
    }
    finally {
        client.release();
        await pool.end();
    }
}
runVotosMigration();
