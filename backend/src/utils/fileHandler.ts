import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Garante que o diretório de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadFile(file: Express.Multer.File): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/\s+/g, '')}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Move o arquivo para o diretório de uploads
    await fs.promises.writeFile(filepath, file.buffer);

    // Retorna o caminho relativo do arquivo
    return filename;
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw new Error('Erro ao fazer upload do arquivo');
  }
}

export async function deleteFile(filename: string): Promise<void> {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Verifica se o arquivo existe antes de tentar deletar
    if (fs.existsSync(filepath)) {
      await unlinkAsync(filepath);
    }
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    throw new Error('Erro ao deletar arquivo');
  }
} 