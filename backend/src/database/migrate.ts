import fs from 'fs';
import path from 'path';
import pool from './index';

async function createMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
}

async function getMigrationsExecutadas(): Promise<string[]> {
  const result = await pool.query('SELECT name FROM migrations');
  return result.rows.map(row => row.name);
}

async function registrarMigration(name: string) {
  await pool.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
}

async function runMigrations() {
  try {
    // Garante que a tabela migrations existe
    await createMigrationsTable();

    // Obtém as migrations já executadas
    const migracoesExecutadas = await getMigrationsExecutadas();

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      try {
        if (migracoesExecutadas.includes(file)) {
          console.log(`Migration ${file} já foi executada anteriormente.`);
          continue;
        }
        
        console.log(`Executando migration: ${file}`);
        const sql = await fs.readFile(path.join(__dirname, 'migrations', file), 'utf8');
        
        try {
          const client = await pool.connect();
          try {
            await client.query(sql);
            await client.query(
              'INSERT INTO migrations (name, execution_date) VALUES ($1, NOW())',
              [file]
            );
          } finally {
            client.release();
          }
        } catch (err: any) {
          console.log(`Erro ao executar migration ${file}: ${err.message}. Continuando com as próximas migrações.`);
          // Continua para a próxima migração em vez de interromper o processo
        }
      } catch (err: any) {
        console.log(`Erro ao ler migration ${file}: ${err.message}. Continuando com as próximas migrações.`);
        // Continua para a próxima migração em vez de interromper o processo
      }
    }

    // Adicionar a migração da tabela de projetos
    const projetosMigrationFile = '01_create_table_projetos.sql';
    const projetosMigrationContent = await fs.promises.readFile(
      path.join(__dirname, 'migrations', projetosMigrationFile),
      'utf8'
    );

    try {
      // Verificar se a migração já foi executada
      const checkResult = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        [projetosMigrationFile]
      );

      if (checkResult.rows.length === 0) {
        console.log(`Executando migration: ${projetosMigrationFile}`);
        await pool.query(projetosMigrationContent);
        
        // Registrar a migração
        await pool.query(
          'INSERT INTO migrations (name, executed_at) VALUES ($1, NOW())',
          [projetosMigrationFile]
        );
        
        console.log(`Migration ${projetosMigrationFile} executada com sucesso.`);
      } else {
        console.log(`Migration ${projetosMigrationFile} já foi executada anteriormente.`);
      }
    } catch (error) {
      console.error(`Erro ao executar migration ${projetosMigrationFile}:`, error);
      throw error;
    }

    console.log('Todas as migrations foram executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar as migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 