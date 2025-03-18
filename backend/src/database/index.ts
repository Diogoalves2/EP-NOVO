import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'camaras_db',
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL com sucesso!');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com PostgreSQL:', err);
});

export default pool; 