import { Request, Response } from 'express';
import { PostgresCamaraModel } from '../models/Camara';
import pool from '../database';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      // Buscar total de câmaras
      const camarasResult = await pool.query('SELECT COUNT(*) as total FROM camaras');
      const totalCamaras = parseInt(camarasResult.rows[0].total);

      // Buscar total de votações em andamento
      const votacoesAndamentoResult = await pool.query(
        'SELECT COUNT(*) as total FROM votacoes WHERE status = $1',
        ['em_andamento']
      );
      const votacoesEmAndamento = parseInt(votacoesAndamentoResult.rows[0].total);

      // Buscar total de votações finalizadas
      const votacoesFinalizadasResult = await pool.query(
        'SELECT COUNT(*) as total FROM votacoes WHERE status = $1',
        ['finalizada']
      );
      const votacoesFinalizadas = parseInt(votacoesFinalizadasResult.rows[0].total);

      res.json({
        camaras_ativas: totalCamaras,
        votacoes_em_andamento: votacoesEmAndamento,
        votacoes_finalizadas: votacoesFinalizadas
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas do dashboard' });
    }
  }
} 