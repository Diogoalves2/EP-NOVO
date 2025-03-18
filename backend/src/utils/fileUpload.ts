import fs from 'fs/promises';
import path from 'path';

const uploadsDir = path.join(__dirname, '../../uploads');

export const uploadFile = async (file: Express.Multer.File, directory: string = '') => {
  const targetDir = path.join(uploadsDir, directory);
  
  try {
    // Garante que o diretório existe
    await fs.mkdir(targetDir, { recursive: true });
    
    // Retorna apenas o nome do arquivo (sem o caminho completo)
    return path.join(directory, file.filename);
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    throw new Error('Erro ao salvar arquivo');
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const fullPath = path.join(uploadsDir, filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    // Não lança erro se o arquivo não existir
  }
}; 