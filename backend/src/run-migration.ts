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
    } else {
      console.log('Atenção: A tabela "votos" não foi encontrada no banco de dados.');
    }
  } catch (err) {
    console.error('Erro ao executar migração:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runVotosMigration(); 