import { Request, Response } from 'express';
import pool from '../database';

// Definir o tipo extendido de Request para incluir o user
interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

class SessoesController {
  async index(req: Request, res: Response) {
    try {
      const { camara_id } = req.query;

      if (!camara_id) {
        return res.status(400).json({ error: 'ID da câmara é obrigatório' });
      }

      const result = await pool.query(
        'SELECT * FROM sessoes WHERE camara_id = $1 ORDER BY data DESC',
        [camara_id]
      );

      return res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar sessões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { titulo, descricao, data, tipo, camara_id } = req.body;

      // Validações básicas
      if (!titulo || !descricao || !data || !tipo || !camara_id) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const result = await pool.query(
        `INSERT INTO sessoes (titulo, descricao, data, tipo, status, camara_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [titulo, descricao, new Date(data), tipo, 'agendada', camara_id]
      );

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM sessoes WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, data, tipo, status } = req.body;

      const fields = [];
      const values = [];
      let paramCount = 1;

      if (titulo) {
        fields.push(`titulo = $${paramCount}`);
        values.push(titulo);
        paramCount++;
      }

      if (descricao) {
        fields.push(`descricao = $${paramCount}`);
        values.push(descricao);
        paramCount++;
      }

      if (data) {
        fields.push(`data = $${paramCount}`);
        values.push(new Date(data));
        paramCount++;
      }

      if (tipo) {
        fields.push(`tipo = $${paramCount}`);
        values.push(tipo);
        paramCount++;
      }

      if (status) {
        fields.push(`status = $${paramCount}`);
        values.push(status);
        paramCount++;
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      values.push(id);
      const query = `
        UPDATE sessoes
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM sessoes WHERE id = $1', [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Método para iniciar uma sessão
  async iniciar(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificação de permissão
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Apenas administradores podem iniciar sessões' 
        });
      }

      // Verifica se a sessão existe
      const result = await pool.query('SELECT * FROM sessoes WHERE id = $1', [id]);
      const sessao = result.rows[0];
      
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (sessao.status === 'em_andamento') {
        return res.status(400).json({ error: 'Esta sessão já está em andamento' });
      }

      if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
        return res.status(400).json({ 
          error: 'Esta sessão já foi finalizada ou cancelada' 
        });
      }

      // Atualiza o status da sessão para "em_andamento"
      const updateResult = await pool.query(
        'UPDATE sessoes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['em_andamento', id]
      );

      return res.json(updateResult.rows[0]);
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Método para finalizar uma sessão
  async finalizar(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificação de permissão
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Apenas administradores podem finalizar sessões' 
        });
      }

      // Verifica se a sessão existe
      const result = await pool.query('SELECT * FROM sessoes WHERE id = $1', [id]);
      const sessao = result.rows[0];
      
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (sessao.status !== 'em_andamento') {
        return res.status(400).json({ 
          error: 'Apenas sessões em andamento podem ser finalizadas',
          status_atual: sessao.status
        });
      }

      // Atualiza o status da sessão para "finalizada"
      const updateResult = await pool.query(
        'UPDATE sessoes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['finalizada', id]
      );

      return res.json(updateResult.rows[0]);
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Método para cancelar uma sessão
  async cancelar(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificação de permissão
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Apenas administradores podem cancelar sessões' 
        });
      }

      // Verifica se a sessão existe
      const result = await pool.query('SELECT * FROM sessoes WHERE id = $1', [id]);
      const sessao = result.rows[0];
      
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
        return res.status(400).json({ 
          error: 'Esta sessão já foi finalizada ou cancelada' 
        });
      }

      // Atualiza o status da sessão para "cancelada"
      const updateResult = await pool.query(
        'UPDATE sessoes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        ['cancelada', id]
      );

      return res.json(updateResult.rows[0]);
    } catch (error) {
      console.error('Erro ao cancelar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new SessoesController(); 