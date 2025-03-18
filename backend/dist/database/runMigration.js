"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
(0, dotenv_1.config)();
const pool = new pg_1.Pool({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});
async function runMigration() {
    try {
        // Lê o arquivo de migração
        const migrationPath = path_1.default.join(__dirname, 'migrations', '002_add_vereador_fields.sql');
        const migration = fs_1.default.readFileSync(migrationPath, 'utf8');
        // Executa a migração
        await pool.query(migration);
        console.log('Migração executada com sucesso!');
    }
    catch (error) {
        console.error('Erro ao executar migração:', error);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
runMigration();
