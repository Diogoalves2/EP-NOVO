"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./index"));
async function createMigrationsTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
    await index_1.default.query(sql);
}
async function getMigrationsExecutadas() {
    const result = await index_1.default.query('SELECT name FROM migrations');
    return result.rows.map(row => row.name);
}
async function registrarMigration(name) {
    await index_1.default.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}
async function runMigrations() {
    try {
        // Garante que a tabela migrations existe
        await createMigrationsTable();
        // Obtém as migrations já executadas
        const migracoesExecutadas = await getMigrationsExecutadas();
        const migrationsDir = path_1.default.join(__dirname, 'migrations');
        const files = fs_1.default.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        for (const file of files) {
            try {
                if (migracoesExecutadas.includes(file)) {
                    console.log(`Migration ${file} já foi executada anteriormente.`);
                    continue;
                }
                console.log(`Executando migration: ${file}`);
                const sql = await fs_1.default.readFile(path_1.default.join(__dirname, 'migrations', file), 'utf8');
                try {
                    const client = await index_1.default.connect();
                    try {
                        await client.query(sql);
                        await client.query('INSERT INTO migrations (name, execution_date) VALUES ($1, NOW())', [file]);
                    }
                    finally {
                        client.release();
                    }
                }
                catch (err) {
                    console.log(`Erro ao executar migration ${file}: ${err.message}. Continuando com as próximas migrações.`);
                    // Continua para a próxima migração em vez de interromper o processo
                }
            }
            catch (err) {
                console.log(`Erro ao ler migration ${file}: ${err.message}. Continuando com as próximas migrações.`);
                // Continua para a próxima migração em vez de interromper o processo
            }
        }
        // Adicionar a migração da tabela de projetos
        const projetosMigrationFile = '01_create_table_projetos.sql';
        const projetosMigrationContent = await fs_1.default.promises.readFile(path_1.default.join(__dirname, 'migrations', projetosMigrationFile), 'utf8');
        try {
            // Verificar se a migração já foi executada
            const checkResult = await index_1.default.query('SELECT * FROM migrations WHERE name = $1', [projetosMigrationFile]);
            if (checkResult.rows.length === 0) {
                console.log(`Executando migration: ${projetosMigrationFile}`);
                await index_1.default.query(projetosMigrationContent);
                // Registrar a migração
                await index_1.default.query('INSERT INTO migrations (name, executed_at) VALUES ($1, NOW())', [projetosMigrationFile]);
                console.log(`Migration ${projetosMigrationFile} executada com sucesso.`);
            }
            else {
                console.log(`Migration ${projetosMigrationFile} já foi executada anteriormente.`);
            }
        }
        catch (error) {
            console.error(`Erro ao executar migration ${projetosMigrationFile}:`, error);
            throw error;
        }
        console.log('Todas as migrations foram executadas com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao executar as migrations:', error);
        process.exit(1);
    }
}
runMigrations();
