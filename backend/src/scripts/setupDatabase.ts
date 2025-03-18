import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
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
      const checkMigration = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        ['01_create_table_projetos.sql']
      );
      
      if (checkMigration.rows.length === 0) {
        await pool.query(
          'INSERT INTO migrations (name, executed_at) VALUES ($1, NOW())',
          ['01_create_table_projetos.sql']
        );
      }
    }
    
    console.log('Migração da tabela de projetos concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migração:', error);
  } finally {
    // Fechar a conexão com o pool
    await pool.end();
  }
}

// Executar a migração
criarTabelaProjetos(); 