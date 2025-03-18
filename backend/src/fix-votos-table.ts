import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
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
    
  } catch (err) {
    console.error('Erro ao corrigir tabela votos:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixVotosTable(); 