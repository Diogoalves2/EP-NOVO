import pool from '../database';
import { Camara } from './Camara';

export type TipoSessao = 
  | 'ordinaria'
  | 'extraordinaria'
  | 'solene'
  | 'secreta'
  | 'instalacao_legislatura'
  | 'comunitaria';

export type StatusSessao = 
  | 'agendada'
  | 'em_andamento'
  | 'finalizada'
  | 'cancelada';

export interface Sessao {
  id: number;
  titulo: string;
  descricao: string;
  data: Date;
  status: StatusSessao;
  tipo: TipoSessao;
  camara_id: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresSessaoModel {
  static async findAll(): Promise<Sessao[]> {
    const result = await pool.query('SELECT * FROM sessoes ORDER BY data DESC');
    return result.rows;
  }

  static async findById(id: number): Promise<Sessao | null> {
    const result = await pool.query('SELECT * FROM sessoes WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByCamaraId(camaraId: number): Promise<Sessao[]> {
    const result = await pool.query(
      'SELECT * FROM sessoes WHERE camara_id = $1 ORDER BY data DESC',
      [camaraId]
    );
    return result.rows;
  }

  static async create(sessaoData: Omit<Sessao, 'id' | 'created_at' | 'updated_at'>): Promise<Sessao> {
    const {
      titulo,
      descricao,
      data,
      tipo,
      status,
      camara_id
    } = sessaoData;

    const result = await pool.query(
      `INSERT INTO sessoes (titulo, descricao, data, tipo, status, camara_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [titulo, descricao, data, tipo, status || 'agendada', camara_id]
    );

    return result.rows[0];
  }

  static async update(id: number, sessaoData: Partial<Omit<Sessao, 'id' | 'created_at' | 'updated_at'>>): Promise<Sessao | null> {
    const fields = Object.keys(sessaoData);
    if (fields.length === 0) return null;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(sessaoData);

    const query = `
      UPDATE sessoes
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM sessoes WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

// Exporta a função de inicialização dos relacionamentos
export const initSessaoAssociations = () => {
  // Os relacionamentos serão inicializados após todos os modelos serem definidos
  // Isso evita problemas de referência circular
}; 