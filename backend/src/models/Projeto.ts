import pool from '../database';

export enum StatusProjeto {
  APRESENTADO = 'apresentado',
  EM_VOTACAO = 'em_votacao',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado'
}

export interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  autor: string;
  status: StatusProjeto;
  data_apresentacao: Date;
  sessao_id: number;
  camara_id: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresProjetoModel {
  static async findAll(): Promise<Projeto[]> {
    const result = await pool.query('SELECT * FROM projetos ORDER BY created_at DESC');
    return result.rows;
  }

  static async findById(id: number): Promise<Projeto | null> {
    const result = await pool.query('SELECT * FROM projetos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByCamaraId(camaraId: number): Promise<Projeto[]> {
    const result = await pool.query(
      'SELECT * FROM projetos WHERE camara_id = $1 ORDER BY created_at DESC',
      [camaraId]
    );
    return result.rows;
  }

  static async findBySessaoId(sessaoId: number): Promise<Projeto[]> {
    const result = await pool.query(
      'SELECT * FROM projetos WHERE sessao_id = $1 ORDER BY created_at DESC',
      [sessaoId]
    );
    return result.rows;
  }

  static async create(projetoData: Omit<Projeto, 'id' | 'created_at' | 'updated_at'>): Promise<Projeto> {
    try {
      console.log('Criando projeto com dados:', projetoData);
      
      const {
        titulo,
        descricao,
        autor,
        status,
        data_apresentacao,
        sessao_id,
        camara_id
      } = projetoData;

      const result = await pool.query(
        `INSERT INTO projetos (titulo, descricao, autor, status, data_apresentacao, sessao_id, camara_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [titulo, descricao, autor, status || 'apresentado', data_apresentacao || new Date(), sessao_id, camara_id]
      );

      console.log('Projeto criado com sucesso:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar projeto no model:', error);
      throw error;
    }
  }

  static async update(id: number, projetoData: Partial<Omit<Projeto, 'id' | 'created_at' | 'updated_at'>>): Promise<Projeto | null> {
    const fields = Object.keys(projetoData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(projetoData);

    const query = `
      UPDATE projetos
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM projetos WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
} 