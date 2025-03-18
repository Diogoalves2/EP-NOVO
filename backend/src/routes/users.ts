import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';
import fs from 'fs';

const router = express.Router();

// Criar diretório uploads se não existir
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'foto') {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Por favor, envie apenas imagens jpg, jpeg ou png.'));
    }
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas
router.get('/', UserController.index);
router.get('/:id', UserController.show);
router.post('/', upload.single('foto'), UserController.create);
router.put('/:id', upload.single('foto'), UserController.update);
router.delete('/:id', UserController.delete);

export default router; 