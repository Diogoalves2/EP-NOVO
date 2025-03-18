import { PostgresUserModel } from '../models/User';
import pool from '../database';
import bcrypt from 'bcrypt';

async function createTestPresident() {
  try {
    console.log('Iniciando criação de presidente de teste...');
    
    // Verificar se há uma câmara no sistema
    const camarasResult = await pool.query('SELECT * FROM camaras LIMIT 1');
    
    if (camarasResult.rows.length === 0) {
      console.error('Nenhuma câmara encontrada. Por favor, crie uma câmara primeiro.');
      process.exit(1);
    }
    
    const camara = camarasResult.rows[0];
    console.log(`Usando câmara: ${camara.nome} (ID: ${camara.id})`);
    
    // Criar um novo usuário presidente com credenciais conhecidas
    const email = 'presidente@teste.com';
    const password = 'senha123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Verificar se o usuário já existe
    const existingUser = await PostgresUserModel.findByEmail(email);
    
    if (existingUser) {
      console.log(`Usuário ${email} já existe. Atualizando para role admin...`);
      
      // Atualizar o usuário para role admin e atualizar a senha
      await pool.query(`
        UPDATE users 
        SET role = 'admin', password = $1
        WHERE id = $2
      `, [hashedPassword, existingUser.id]);
      
      console.log(`Usuário atualizado: ID ${existingUser.id}`);
      console.log('Email:', email);
      console.log('Senha:', password);
    } else {
      // Criar um novo usuário presidente
      const result = await pool.query(`
        INSERT INTO users (name, email, password, role, cargo, partido, camara_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, ['Presidente Teste', email, hashedPassword, 'admin', 'Presidente', 'Partido Teste', camara.id]);
      
      console.log('Usuário presidente de teste criado com sucesso!');
      console.log('ID:', result.rows[0].id);
      console.log('Email:', email);
      console.log('Senha:', password);
    }
    
    console.log('Processo concluído.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar presidente de teste:', error);
    process.exit(1);
  }
}

// Executar a função
createTestPresident(); 