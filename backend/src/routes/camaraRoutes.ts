import express from 'express';
import { PostgresCamaraModel } from '../models/Camara';
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import fs from 'fs';

const router = express.Router();

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadsDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'logo' || file.fieldname.startsWith('foto_vereador_')) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Apenas imagens são permitidas para logo e fotos de vereadores'));
      }
    } else if (file.fieldname === 'regimentoInterno') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('O regimento interno deve ser um arquivo PDF'));
      }
    }
    cb(null, true);
  }
});

// Função para validar os dados da câmara
const validarDadosCamara = (data: any) => {
  const camposObrigatorios = ['nome', 'endereco', 'cidade', 'estado', 'cep', 'telefone', 'email'];
  const camposFaltando = camposObrigatorios.filter(campo => !data[campo]);
  
  if (camposFaltando.length > 0) {
    throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
  }

  if (!Array.isArray(data.vereadores) || data.vereadores.length === 0) {
    throw new Error('É necessário incluir pelo menos um vereador');
  }

  data.vereadores.forEach((vereador: any, index: number) => {
    const camposVereador = ['nome', 'email', 'senha', 'partido', 'cargo'];
    const camposFaltandoVereador = camposVereador.filter(campo => !vereador[campo]);
    
    if (camposFaltandoVereador.length > 0) {
      throw new Error(`Campos obrigatórios faltando para o vereador ${index + 1}: ${camposFaltandoVereador.join(', ')}`);
    }
  });
};

// Configurar campos para upload
const uploadFields = [
  { name: 'logo', maxCount: 1 },
  { name: 'regimentoInterno', maxCount: 1 }
];

// Adicionar campos dinâmicos para fotos dos vereadores
for (let i = 0; i < 50; i++) {
  uploadFields.push({ name: `foto_vereador_${i}`, maxCount: 1 });
}

// Rota para criar uma nova câmara
router.post('/', upload.fields(uploadFields), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;
    
    if (!files?.logo?.[0]) {
      return res.status(400).json({ error: 'O logo da câmara é obrigatório' });
    }

    if (!files?.regimentoInterno?.[0]) {
      return res.status(400).json({ error: 'O regimento interno é obrigatório' });
    }

    const vereadores = JSON.parse(req.body.vereadores);

    const camaraData = {
      ...req.body,
      logo: files.logo[0].filename,
      regimentoInterno: files.regimentoInterno[0].filename,
      vereadores: vereadores.map((vereador: any, index: number) => ({
        ...vereador,
        foto: vereador.foto ? files[`foto_vereador_${index}`]?.[0]?.filename : undefined
      }))
    };

    // Validar dados antes de criar
    validarDadosCamara(camaraData);

    const camara = await PostgresCamaraModel.create(camaraData);
    res.status(201).json(camara);
  } catch (error: any) {
    console.error('Erro ao criar câmara:', error);
    
    // Remover arquivos enviados em caso de erro
    if (req.files) {
      const files = req.files as { [key: string]: Express.Multer.File[] };
      Object.values(files).flat().forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Erro ao remover arquivo:', err);
        });
      });
    }

    // Retornar mensagem de erro apropriada
    res.status(400).json({ 
      error: error.message || 'Erro ao criar câmara',
      details: error.errors ? Object.values(error.errors).map((err: any) => err.message) : undefined
    });
  }
});

// Rota para listar todas as câmaras
router.get('/', async (_req: Request, res: Response) => {
  try {
    const camaras = await PostgresCamaraModel.findAll();
    res.json(camaras);
  } catch (error) {
    console.error('Erro ao listar câmaras:', error);
    res.status(500).json({ error: 'Erro ao listar câmaras' });
  }
});

// Rota para buscar uma câmara específica
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const camara = await PostgresCamaraModel.findById(Number(req.params.id));
    if (!camara) {
      return res.status(404).json({ error: 'Câmara não encontrada' });
    }
    res.json(camara);
  } catch (error) {
    console.error('Erro ao buscar câmara:', error);
    res.status(500).json({ error: 'Erro ao buscar câmara' });
  }
});

export default router; 