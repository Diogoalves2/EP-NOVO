import { Request, Response } from 'express';
import { PostgresCamaraModel } from '../models/Camara';
import { PostgresUserModel } from '../models/User';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

const pool = new Pool();

export class CamaraController {
  static async index(req: Request, res: Response) {
    try {
      const camaras = await PostgresCamaraModel.findAll();
      res.json(camaras);
    } catch (error) {
      console.error('Erro ao listar câmaras:', error);
      res.status(500).json({ error: 'Erro ao listar câmaras' });
    }
  }

  static async show(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const camara = await PostgresCamaraModel.findById(id);
      
      if (!camara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      res.json(camara);
    } catch (error) {
      console.error('Erro ao buscar câmara:', error);
      res.status(500).json({ error: 'Erro ao buscar câmara' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      console.log('Corpo da requisição:', req.body);
      console.log('Arquivos recebidos:', req.files);

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { nome, endereco, cidade, estado, cep, telefone, email, site } = req.body;
      const vereadores = JSON.parse(req.body.vereadores);

      // Validar campos obrigatórios
      if (!nome || !endereco || !cidade || !estado || !cep || !telefone || !email) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (!files?.logo?.[0]) {
        return res.status(400).json({ error: 'O logo da câmara é obrigatório' });
      }

      if (!files?.regimentoInterno?.[0]) {
        return res.status(400).json({ error: 'O regimento interno é obrigatório' });
      }

      // Verificar se existe um vereador com cargo "Presidente"
      const presidenteIndex = vereadores.findIndex((v: any) => 
        v.cargo && v.cargo.toLowerCase() === 'presidente'
      );

      // Validar que apenas um vereador tenha o cargo de Presidente
      let numPresidentes = 0;
      vereadores.forEach((v: any) => {
        if (v.cargo && v.cargo.toLowerCase() === 'presidente') {
          numPresidentes++;
        }
      });

      if (numPresidentes > 1) {
        return res.status(400).json({ 
          error: 'Apenas um vereador pode ter o cargo de Presidente'
        });
      }

      // Criar a câmara
      const camara = await PostgresCamaraModel.create({
        nome,
        endereco,
        cidade,
        estado,
        cep,
        telefone,
        email,
        site: site || null,
        logo: files.logo[0].filename,
        regimento_interno: files.regimentoInterno[0].filename
      });

      // Criar os vereadores
      for (const vereador of vereadores) {
        const fotoField = `foto_vereador_${vereadores.indexOf(vereador)}`;
        const foto = files[fotoField]?.[0]?.filename;

        // Hash da senha
        const hashedPassword = await bcrypt.hash(vereador.senha, 10);

        // Verificar se este vereador é o presidente (possui cargo de "Presidente")
        const isPresidente = vereador.cargo && vereador.cargo.toLowerCase() === 'presidente';
        
        await PostgresUserModel.create({
          name: vereador.nome,
          email: vereador.email,
          password: hashedPassword,
          role: isPresidente ? 'admin' : 'vereador', // O presidente recebe o papel de admin
          partido: vereador.partido,
          cargo: vereador.cargo,
          foto: foto || null,
          camara_id: camara.id
        });
      }

      // Garante que o vereador com cargo 'Presidente' seja admin
      const presidente = await pool.query(
        'SELECT id FROM users WHERE camara_id = $1 AND LOWER(cargo) = $2',
        [camara.id, 'presidente']
      );

      if (presidente.rows.length > 0) {
        // Atualiza o vereador presidente para ser admin
        await pool.query(
          'UPDATE users SET role = $1 WHERE id = $2',
          ['admin', presidente.rows[0].id]
        );
        
        console.log(`Vereador com ID ${presidente.rows[0].id} definido como admin por ser Presidente da Câmara`);
      }

      res.status(201).json(camara);
    } catch (error) {
      console.error('Erro ao criar câmara:', error);
      
      // Se houver arquivos enviados, tenta removê-los em caso de erro
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        Object.values(files).flat().forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Erro ao remover arquivo:', unlinkError);
          }
        });
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao criar câmara' });
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      console.log('Iniciando atualização da câmara');
      console.log('Corpo da requisição:', req.body);
      console.log('Arquivos recebidos:', req.files);

      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { nome, endereco, cidade, estado, cep, telefone, email, site } = req.body;

      // Validar campos obrigatórios
      if (!nome || !endereco || !cidade || !estado || !cep || !telefone || !email) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      // Busca a câmara existente
      const existingCamara = await PostgresCamaraModel.findById(id);
      if (!existingCamara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      // Prepara os dados para atualização
      const updateData: any = {
        nome,
        endereco,
        cidade,
        estado,
        cep,
        telefone,
        email,
        site: site || null
      };

      // Atualiza os arquivos se fornecidos
      if (files?.logo?.[0]) {
        // Remove o logo antigo
        if (existingCamara.logo) {
          const oldLogoPath = path.join(__dirname, '../../uploads', existingCamara.logo);
          try {
            fs.unlinkSync(oldLogoPath);
            console.log('Logo antigo removido:', oldLogoPath);
          } catch (error) {
            console.error('Erro ao remover logo antigo:', error);
          }
        }
        updateData.logo = files.logo[0].filename;
        console.log('Novo logo:', files.logo[0].filename);
      }

      if (files?.regimentoInterno?.[0]) {
        // Remove o regimento antigo
        if (existingCamara.regimento_interno) {
          const oldRegimentoPath = path.join(__dirname, '../../uploads', existingCamara.regimento_interno);
          try {
            fs.unlinkSync(oldRegimentoPath);
            console.log('Regimento antigo removido:', oldRegimentoPath);
          } catch (error) {
            console.error('Erro ao remover regimento antigo:', error);
          }
        }
        updateData.regimento_interno = files.regimentoInterno[0].filename;
        console.log('Novo regimento:', files.regimentoInterno[0].filename);
      }

      console.log('Dados para atualização:', updateData);

      // Atualiza a câmara
      const updatedCamara = await PostgresCamaraModel.update(id, updateData);
      if (!updatedCamara) {
        return res.status(404).json({ error: 'Erro ao atualizar câmara' });
      }

      console.log('Câmara atualizada com sucesso:', updatedCamara);
      res.json(updatedCamara);
    } catch (error) {
      console.error('Erro ao atualizar câmara:', error);

      // Se houver arquivos enviados e ocorrer um erro, remove-os
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        Object.values(files).flat().forEach(file => {
          const filePath = path.join(__dirname, '../../uploads', file.filename);
          try {
            fs.unlinkSync(filePath);
            console.log('Arquivo removido após erro:', filePath);
          } catch (unlinkError) {
            console.error('Erro ao remover arquivo:', unlinkError);
          }
        });
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar câmara' });
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      // Busca a câmara antes de deletar
      const camara = await PostgresCamaraModel.findById(id);
      if (!camara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      // Remove os arquivos da câmara
      if (camara.logo) {
        const logoPath = path.join(__dirname, '../../uploads', camara.logo);
        try {
          fs.unlinkSync(logoPath);
        } catch (error) {
          console.error('Erro ao remover logo:', error);
        }
      }

      if (camara.regimento_interno) {
        const regimentoPath = path.join(__dirname, '../../uploads', camara.regimento_interno);
        try {
          fs.unlinkSync(regimentoPath);
        } catch (error) {
          console.error('Erro ao remover regimento:', error);
        }
      }

      // Deleta a câmara
      const deleted = await PostgresCamaraModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar câmara:', error);
      res.status(500).json({ error: 'Erro ao deletar câmara' });
    }
  }

  static async updateLogo(req: Request, res: Response) {
    try {
      console.log('Iniciando atualização do logo da câmara');
      console.log('Corpo da requisição:', req.body);
      console.log('Arquivos recebidos:', req.files);

      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Verifica se a câmara existe
      const existingCamara = await PostgresCamaraModel.findById(id);
      if (!existingCamara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      // Verifica se há um arquivo de logo
      if (!files?.logo?.[0]) {
        return res.status(400).json({ error: 'Arquivo de logo não fornecido' });
      }

      // Remove o logo antigo se existir
      if (existingCamara.logo) {
        const oldLogoPath = path.join(__dirname, '../../uploads', existingCamara.logo);
        try {
          fs.unlinkSync(oldLogoPath);
          console.log('Logo antigo removido:', oldLogoPath);
        } catch (error) {
          console.error('Erro ao remover logo antigo:', error);
        }
      }

      // Atualiza apenas o logo
      const updateData = {
        logo: files.logo[0].filename
      };

      console.log('Atualizando logo:', updateData);
      const updatedCamara = await PostgresCamaraModel.update(id, updateData);
      
      if (!updatedCamara) {
        return res.status(500).json({ error: 'Erro ao atualizar logo da câmara' });
      }

      console.log('Logo atualizado com sucesso');
      res.json({ message: 'Logo atualizado com sucesso', camara: updatedCamara });
    } catch (error) {
      console.error('Erro ao atualizar logo da câmara:', error);
      
      // Se houver arquivo enviado, tenta removê-lo em caso de erro
      if (req.files && (req.files as any).logo) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const filePath = path.join(__dirname, '../../uploads', files.logo[0].filename);
        try {
          fs.unlinkSync(filePath);
          console.log('Arquivo de logo removido após erro:', filePath);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo de logo:', unlinkError);
        }
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar logo da câmara' });
      }
    }
  }

  static async updateRegimento(req: Request, res: Response) {
    try {
      console.log('Iniciando atualização do regimento da câmara');
      console.log('Corpo da requisição:', req.body);
      console.log('Arquivos recebidos:', req.files);

      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Verifica se a câmara existe
      const existingCamara = await PostgresCamaraModel.findById(id);
      if (!existingCamara) {
        return res.status(404).json({ error: 'Câmara não encontrada' });
      }

      // Verifica se há um arquivo de regimento
      if (!files?.regimentoInterno?.[0]) {
        return res.status(400).json({ error: 'Arquivo de regimento interno não fornecido' });
      }

      // Remove o regimento antigo se existir
      if (existingCamara.regimento_interno) {
        const oldRegimentoPath = path.join(__dirname, '../../uploads', existingCamara.regimento_interno);
        try {
          fs.unlinkSync(oldRegimentoPath);
          console.log('Regimento antigo removido:', oldRegimentoPath);
        } catch (error) {
          console.error('Erro ao remover regimento antigo:', error);
        }
      }

      // Atualiza apenas o regimento
      const updateData = {
        regimento_interno: files.regimentoInterno[0].filename
      };

      console.log('Atualizando regimento:', updateData);
      const updatedCamara = await PostgresCamaraModel.update(id, updateData);
      
      if (!updatedCamara) {
        return res.status(500).json({ error: 'Erro ao atualizar regimento da câmara' });
      }

      console.log('Regimento atualizado com sucesso');
      res.json({ message: 'Regimento atualizado com sucesso', camara: updatedCamara });
    } catch (error) {
      console.error('Erro ao atualizar regimento da câmara:', error);
      
      // Se houver arquivo enviado, tenta removê-lo em caso de erro
      if (req.files && (req.files as any).regimentoInterno) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const filePath = path.join(__dirname, '../../uploads', files.regimentoInterno[0].filename);
        try {
          fs.unlinkSync(filePath);
          console.log('Arquivo de regimento removido após erro:', filePath);
        } catch (unlinkError) {
          console.error('Erro ao remover arquivo de regimento:', unlinkError);
        }
      }

      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar regimento da câmara' });
      }
    }
  }
} 