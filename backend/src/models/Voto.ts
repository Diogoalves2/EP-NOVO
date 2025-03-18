import pool from '../database';

export enum TipoVoto {
  SIM = 'sim',
  NAO = 'nao',
  ABSTER = 'abster'
}

export interface Voto {
  id: number;
  projeto_id: number;
  vereador_id: number;
  tipo_voto: TipoVoto;
  created_at: Date;
}

export class PostgresVotoModel {
  static async findByProjetoId(projetoId: number): Promise<Voto[]> {
    const result = await pool.query(
      'SELECT * FROM votos WHERE projeto_id = $1 ORDER BY created_at ASC',
      [projetoId]
    );
    return result.rows;
  }

  static async findByVereadorAndProjeto(vereadorId: number, projetoId: number): Promise<Voto | null> {
    const result = await pool.query(
      'SELECT * FROM votos WHERE vereador_id = $1 AND projeto_id = $2',
      [vereadorId, projetoId]
    );
    return result.rows[0] || null;
  }

  static async create(votoData: Omit<Voto, 'id' | 'created_at'>): Promise<Voto> {
    const { projeto_id, vereador_id, tipo_voto } = votoData;

    const result = await pool.query(
      `INSERT INTO votos (projeto_id, vereador_id, tipo_voto)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [projeto_id, vereador_id, tipo_voto]
    );

    return result.rows[0];
  }

  static async contarVotos(projetoId: number): Promise<{sim: number, nao: number, abster: number}> {
    const result = await pool.query(
      `SELECT 
        COUNT(CASE WHEN tipo_voto = 'sim' THEN 1 END) as sim,
        COUNT(CASE WHEN tipo_voto = 'nao' THEN 1 END) as nao,
        COUNT(CASE WHEN tipo_voto = 'abster' THEN 1 END) as abster
       FROM votos 
       WHERE projeto_id = $1`,
      [projetoId]
    );
    
    return result.rows[0];
  }

  static async excluirVotosDeUmProjeto(projetoId: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM votos WHERE projeto_id = $1', [projetoId]);
    return (result.rowCount ?? 0) > 0;
  }
} 