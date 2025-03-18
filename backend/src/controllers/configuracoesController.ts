import { Request, Response } from 'express';
import { PostgresConfiguracoesModel } from '../models/Configuracoes';

class ConfiguracoesController {
  async index(req: Request, res: Response) {
    try {
      const configuracoes = await PostgresConfiguracoesModel.findAll();
      return res.json(configuracoes);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { nome_camara, endereco, telefone, email } = req.body;
      const logo = req.file?.filename;

      const configuracoes = await PostgresConfiguracoesModel.update({
        ...(nome_camara && { nome_camara }),
        ...(endereco && { endereco }),
        ...(telefone && { telefone }),
        ...(email && { email }),
        ...(logo && { logo })
      });

      if (!configuracoes) {
        return res.status(404).json({ error: 'Configurações não encontradas' });
      }

      return res.json(configuracoes);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new ConfiguracoesController(); 