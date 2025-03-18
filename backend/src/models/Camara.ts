import pool from '../database';

export interface Camara {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  site?: string;
  logo?: string;
  regimento_interno?: string;
  created_at: Date;
  updated_at: Date;
}

export class PostgresCamaraModel {
  static async findAll(): Promise<Camara[]> {
    const result = await pool.query('SELECT * FROM camaras ORDER BY nome');
    return result.rows;
  }

  static async findById(id: number): Promise<Camara | null> {
    const result = await pool.query('SELECT * FROM camaras WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(camara: Omit<Camara, 'id' | 'created_at' | 'updated_at'>): Promise<Camara> {
    const {
      nome, endereco, cidade, estado, cep, telefone, email,
      site, logo, regimento_interno
    } = camara;

    const result = await pool.query(
      `INSERT INTO camaras (
        nome, endereco, cidade, estado, cep, telefone, email,
        site, logo, regimento_interno
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [nome, endereco, cidade, estado, cep, telefone, email,
       site, logo, regimento_interno]
    );

    return result.rows[0];
  }

  static async update(id: number, camara: Partial<Omit<Camara, 'id' | 'created_at' | 'updated_at'>>): Promise<Camara | null> {
    // Primeiro, verifica se a câmara existe
    const exists = await this.findById(id);
    if (!exists) return null;

    // Constrói a query dinamicamente baseada nos campos fornecidos
    const fields = Object.keys(camara).filter(key => camara[key as keyof typeof camara] !== undefined);
    if (fields.length === 0) return exists;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => camara[field as keyof typeof camara]);

    const query = `
      UPDATE camaras
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM camaras WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
} 