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
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'camaras_db',
});
async function criarTabelaProjetos() {
    console.log('Executando migração da tabela de projetos...');
    try {
        // Verificar se a tabela já existe
        const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'projetos'
      );
    `);
        if (checkTable.rows[0].exists) {
            console.log('A tabela projetos já existe. Pulando criação.');
            return;
        }
        // Caminho para o arquivo SQL de migração
        const migrationFilePath = path.join(__dirname, '../database/migrations/01_create_table_projetos.sql');
        // Lê o conteúdo do arquivo SQL
        const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
        // Executa o SQL no banco de dados
        await pool.query(sqlContent);
        // Registrar a migração se existir a tabela migrations
        const checkMigrationsTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'migrations'
      );
    `);
        if (checkMigrationsTable.rows[0].exists) {
            // Verificar se a migração já foi registrada
            const checkMigration = await pool.query('SELECT * FROM migrations WHERE name = $1', ['01_create_table_projetos.sql']);
            if (checkMigration.rows.length === 0) {
                await pool.query('INSERT INTO migrations (name, executed_at) VALUES ($1, NOW())', ['01_create_table_projetos.sql']);
            }
        }
        console.log('Migração da tabela de projetos concluída com sucesso!');
    }
    catch (error) {
        console.error('Erro ao executar migração:', error);
    }
    finally {
        // Fechar a conexão com o pool
        await pool.end();
    }
}
// Executar a migração
criarTabelaProjetos();
