import { Request, Response } from 'express';
import { PostgresSessaoModel } from '../models/Sessao';
import { PostgresCamaraModel } from '../models/Camara';

// Definir o tipo extendido de Request para incluir o user
// (isso não deve ser necessário se o arquivo express.d.ts estiver corretamente configurado no projeto)
interface RequestWithUser extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

class SessaoController {
  async index(req: Request, res: Response) {
    try {
      const { camara_id } = req.query;

      if (!camara_id) {
        return res.status(400).json({ error: 'ID da câmara é obrigatório' });
      }

      const sessoes = await PostgresSessaoModel.findByCamaraId(Number(camara_id));

      return res.json(sessoes);
    } catch (error) {
      console.error('Erro ao listar sessões:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { titulo, descricao, data, tipo, status, camara_id } = req.body;

      // Validações
      if (!titulo || !descricao || !data || !tipo || !camara_id) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verifica se a câmara existe
      const camara = await PostgresCamaraModel.findById(Number(camara_id));
      if (!camara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      const sessao = await PostgresSessaoModel.create({
        titulo,
        descricao,
        data,
        tipo,
        status: status || 'agendada',
        camara_id,
      });

      return res.status(201).json(sessao);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, descricao, data, tipo, status } = req.body;

      const sessao = await PostgresSessaoModel.findById(Number(id));
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      // Atualiza os campos
      const sessaoAtualizada = await PostgresSessaoModel.update(Number(id), {
        titulo: titulo || sessao.titulo,
        descricao: descricao || sessao.descricao,
        data: data || sessao.data,
        tipo: tipo || sessao.tipo,
        status: status || sessao.status,
      });

      return res.json(sessaoAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sessao = await PostgresSessaoModel.findById(Number(id));
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      await PostgresSessaoModel.delete(Number(id));

      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const sessao = await PostgresSessaoModel.findById(Number(id));
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      return res.json(sessao);
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
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

      const sessao = await PostgresSessaoModel.findById(Number(id));
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
      const sessaoAtualizada = await PostgresSessaoModel.update(Number(id), { status: 'em_andamento' });

      return res.json(sessaoAtualizada);
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

      const sessao = await PostgresSessaoModel.findById(Number(id));
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
      const sessaoAtualizada = await PostgresSessaoModel.update(Number(id), { status: 'finalizada' });

      return res.json(sessaoAtualizada);
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

      const sessao = await PostgresSessaoModel.findById(Number(id));
      if (!sessao) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      if (sessao.status === 'finalizada' || sessao.status === 'cancelada') {
        return res.status(400).json({ 
          error: 'Esta sessão já foi finalizada ou cancelada' 
        });
      }

      // Atualiza o status da sessão para "cancelada"
      const sessaoAtualizada = await PostgresSessaoModel.update(Number(id), { status: 'cancelada' });

      return res.json(sessaoAtualizada);
    } catch (error) {
      console.error('Erro ao cancelar sessão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

// Exportar a instância
export default new SessaoController(); 