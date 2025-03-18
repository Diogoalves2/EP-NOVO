import { Pool } from 'pg';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});

async function runMigration() {
  try {
    // Lê o arquivo de migração
    const migrationPath = path.join(__dirname, 'migrations', '002_add_vereador_fields.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Executa a migração
    await pool.query(migration);
    console.log('Migração executada com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration(); 