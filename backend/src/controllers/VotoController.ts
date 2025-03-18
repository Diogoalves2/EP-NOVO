import { Request, Response } from 'express';
import { PostgresVotoModel, TipoVoto } from '../models/Voto';
import { PostgresProjetoModel, StatusProjeto } from '../models/Projeto';
import pool from '../database';

// Definir o tipo extendido de Request para incluir o user
interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

class VotoController {
  async listarVotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID do projeto é obrigatório' });
      }
      
      const votos = await PostgresVotoModel.findByProjetoId(Number(id));
      
      return res.json(votos);
    } catch (error) {
      console.error('Erro ao listar votos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  async contarVotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID do projeto é obrigatório' });
      }
      
      const contagem = await PostgresVotoModel.contarVotos(Number(id));
      
      return res.json(contagem);
    } catch (error) {
      console.error('Erro ao contar votos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  async registrarVoto(req: RequestWithUser, res: Response) {
    // Começando uma transação para garantir atomicidade
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { projeto_id } = req.params;
      const { tipo_voto } = req.body;
      const vereador_id = req.user?.id; // Obtém o ID do usuário autenticado
      
      if (!vereador_id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      if (!projeto_id || !tipo_voto) {
        return res.status(400).json({ error: 'ID do projeto e tipo de voto são obrigatórios' });
      }
      
      // Verificar se o tipo de voto é válido
      if (!Object.values(TipoVoto).includes(tipo_voto as TipoVoto)) {
        return res.status(400).json({ error: 'Tipo de voto inválido' });
      }
      
      // Verificar se o projeto existe e está em votação
      const projeto = await PostgresProjetoModel.findById(Number(projeto_id));
      
      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      if (projeto.status !== StatusProjeto.EM_VOTACAO) {
        return res.status(400).json({ error: 'Este projeto não está em votação' });
      }
      
      // Verificar se o vereador já votou neste projeto
      const votoExistente = await PostgresVotoModel.findByVereadorAndProjeto(vereador_id, Number(projeto_id));
      
      if (votoExistente) {
        return res.status(400).json({ error: 'Você já votou neste projeto' });
      }
      
      // Registrar o voto
      const voto = await PostgresVotoModel.create({
        projeto_id: Number(projeto_id),
        vereador_id,
        tipo_voto: tipo_voto as TipoVoto
      });
      
      await client.query('COMMIT');
      return res.status(201).json(voto);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao registrar voto:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
      client.release();
    }
  }
  
  async iniciarVotacao(req: RequestWithUser, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { projeto_id } = req.params;
      const usuario = req.user;
      
      if (!usuario || usuario.role !== 'admin') {
        return res.status(403).json({ error: 'Apenas administradores podem iniciar votações' });
      }
      
      // Verificar se o projeto existe
      const projeto = await PostgresProjetoModel.findById(Number(projeto_id));
      
      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      // Verificar se o projeto já está em votação ou finalizado
      if (projeto.status === StatusProjeto.EM_VOTACAO) {
        return res.status(400).json({ error: 'Este projeto já está em votação' });
      }
      
      if (projeto.status === StatusProjeto.APROVADO || projeto.status === StatusProjeto.REJEITADO) {
        return res.status(400).json({ error: 'Este projeto já foi votado' });
      }
      
      // Verificar se a sessão está em andamento
      const sessaoQuery = await client.query(
        'SELECT status FROM sessoes WHERE id = $1',
        [projeto.sessao_id]
      );
      
      if (sessaoQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }
      
      const sessaoStatus = sessaoQuery.rows[0].status;
      
      if (sessaoStatus !== 'em_andamento') {
        return res.status(400).json({ 
          error: 'Só é possível iniciar votação quando a sessão estiver em andamento',
          status_atual: sessaoStatus
        });
      }
      
      // Atualizar o status do projeto para "em_votacao"
      const projetoAtualizado = await PostgresProjetoModel.update(Number(projeto_id), {
        status: StatusProjeto.EM_VOTACAO
      });
      
      await client.query('COMMIT');
      return res.json(projetoAtualizado);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao iniciar votação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
      client.release();
    }
  }
  
  async finalizarVotacao(req: RequestWithUser, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { projeto_id } = req.params;
      const usuario = req.user;
      
      if (!usuario || usuario.role !== 'admin') {
        return res.status(403).json({ error: 'Apenas administradores podem finalizar votações' });
      }
      
      // Verificar se o projeto existe e está em votação
      const projeto = await PostgresProjetoModel.findById(Number(projeto_id));
      
      if (!projeto) {
        return res.status(404).json({ error: 'Projeto não encontrado' });
      }
      
      if (projeto.status !== StatusProjeto.EM_VOTACAO) {
        return res.status(400).json({ error: 'Este projeto não está em votação' });
      }
      
      // Contar os votos
      const contagem = await PostgresVotoModel.contarVotos(Number(projeto_id));
      
      // Determinar o resultado
      let novoStatus;
      if (contagem.sim > contagem.nao) {
        novoStatus = StatusProjeto.APROVADO;
      } else {
        novoStatus = StatusProjeto.REJEITADO;
      }
      
      // Atualizar o status do projeto
      const projetoAtualizado = await PostgresProjetoModel.update(Number(projeto_id), {
        status: novoStatus
      });
      
      await client.query('COMMIT');
      
      return res.json({
        projeto: projetoAtualizado,
        resultado: {
          status: novoStatus,
          contagem
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao finalizar votação:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
      client.release();
    }
  }
}

// Exportar a instância
export default new VotoController(); 