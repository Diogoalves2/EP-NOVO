import pool from '../database';

interface Configuracoes {
  id: number;
  nome_camara: string;
  endereco: string;
  telefone: string;
  email: string;
  logo?: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgresConfiguracoesModel {
  static async findAll(): Promise<Configuracoes[]> {
    const result = await pool.query('SELECT * FROM configuracoes');
    return result.rows;
  }

  static async update(configData: Partial<Omit<Configuracoes, 'id' | 'created_at' | 'updated_at'>>): Promise<Configuracoes | null> {
    const fields = Object.keys(configData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(configData);

    const query = `
      UPDATE configuracoes
      SET ${setClause}, updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
} 