import bcrypt from 'bcrypt';
import pool from '../database';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'vereador';
  partido?: string;
  cargo?: string;
  foto?: string | null;
  camara_id?: number;
  created_at: Date;
  updated_at: Date;
}

export class PostgresUserModel {
  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY name');
    return result.rows;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findByRole(role: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE role = $1', [role]);
    return result.rows[0] || null;
  }

  static async findByCamaraId(camaraId: number): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users WHERE camara_id = $1 ORDER BY name', [camaraId]);
    return result.rows;
  }

  static async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const {
      name,
      email,
      password,
      role,
      partido,
      cargo,
      foto,
      camara_id
    } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, partido, cargo, foto, camara_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, email, hashedPassword, role, partido, cargo, foto, camara_id]
    );

    return result.rows[0];
  }

  static async update(id: number, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    const fields = Object.keys(data);
    if (fields.length === 0) return null;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = Object.values(data);

    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  static async query(text: string, params?: any[]): Promise<{ rows: User[] }> {
    const result = await pool.query(text, params);
    return result;
  }
} 