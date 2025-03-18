import { Request, Response } from 'express';
import { PostgresPresencaModel } from '../models/Presenca';

class PresencaController {
  /**
   * Lista todas as presenças de uma sessão
   */
  async listarPresencasPorSessao(req: Request, res: Response) {
    try {
      const { sessaoId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      const presencas = await PostgresPresencaModel.findBySessaoId(Number(sessaoId));
      
      return res.status(200).json(presencas);
    } catch (error: any) {
      console.error('Erro ao listar presenças:', error);
      return res.status(500).json({ error: 'Erro ao listar presenças' });
    }
  }
  
  /**
   * Lista apenas vereadores presentes em uma sessão
   */
  async listarPresentes(req: Request, res: Response) {
    try {
      const { sessaoId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      const presentes = await PostgresPresencaModel.findPresentesBySessionId(Number(sessaoId));
      
      return res.status(200).json(presentes);
    } catch (error: any) {
      console.error('Erro ao listar vereadores presentes:', error);
      return res.status(500).json({ error: 'Erro ao listar vereadores presentes' });
    }
  }
  
  /**
   * Registra a presença ou ausência de um vereador
   */
  async registrarPresenca(req: Request, res: Response) {
    try {
      const { sessaoId, vereadorId } = req.params;
      const { presente } = req.body;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      if (!vereadorId || isNaN(Number(vereadorId))) {
        return res.status(400).json({ error: 'ID do vereador inválido' });
      }
      
      if (presente === undefined) {
        return res.status(400).json({ error: 'O status de presença é obrigatório' });
      }
      
      const presenca = await PostgresPresencaModel.registrarPresenca(
        Number(sessaoId),
        Number(vereadorId),
        Boolean(presente)
      );
      
      return res.status(200).json(presenca);
    } catch (error: any) {
      console.error('Erro ao registrar presença:', error);
      return res.status(500).json({ error: 'Erro ao registrar presença' });
    }
  }
  
  /**
   * Marca todos os vereadores de uma câmara como presentes em uma sessão
   */
  async marcarTodosPresentes(req: Request, res: Response) {
    try {
      const { sessaoId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      const totalMarcados = await PostgresPresencaModel.marcarTodosPresentes(Number(sessaoId));
      
      return res.status(200).json({ 
        message: `${totalMarcados} vereadores marcados como presentes`,
        totalMarcados 
      });
    } catch (error: any) {
      console.error('Erro ao marcar todos como presentes:', error);
      return res.status(500).json({ error: 'Erro ao marcar todos como presentes' });
    }
  }
  
  /**
   * Marca todos os vereadores como ausentes em uma sessão
   */
  async marcarTodosAusentes(req: Request, res: Response) {
    try {
      const { sessaoId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      const totalMarcados = await PostgresPresencaModel.marcarTodosAusentes(Number(sessaoId));
      
      return res.status(200).json({ 
        message: `${totalMarcados} vereadores marcados como ausentes`,
        totalMarcados 
      });
    } catch (error: any) {
      console.error('Erro ao marcar todos como ausentes:', error);
      return res.status(500).json({ error: 'Erro ao marcar todos como ausentes' });
    }
  }
  
  /**
   * Verifica se um vereador está presente em uma sessão
   */
  async verificarPresenca(req: Request, res: Response) {
    try {
      const { sessaoId, vereadorId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      if (!vereadorId || isNaN(Number(vereadorId))) {
        return res.status(400).json({ error: 'ID do vereador inválido' });
      }
      
      const estaPresente = await PostgresPresencaModel.verificarPresenca(
        Number(vereadorId),
        Number(sessaoId)
      );
      
      return res.status(200).json({ presente: estaPresente });
    } catch (error: any) {
      console.error('Erro ao verificar presença:', error);
      return res.status(500).json({ error: 'Erro ao verificar presença' });
    }
  }
  
  /**
   * Retorna estatísticas sobre presenças na sessão
   */
  async contarPresencas(req: Request, res: Response) {
    try {
      const { sessaoId } = req.params;
      
      if (!sessaoId || isNaN(Number(sessaoId))) {
        return res.status(400).json({ error: 'ID da sessão inválido' });
      }
      
      const contagem = await PostgresPresencaModel.contarPresencas(Number(sessaoId));
      
      return res.status(200).json(contagem);
    } catch (error: any) {
      console.error('Erro ao contar presenças:', error);
      return res.status(500).json({ error: 'Erro ao contar presenças' });
    }
  }
}

// Exportar uma instância em vez da classe
export default new PresencaController(); 