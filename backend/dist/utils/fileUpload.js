"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
const uploadFile = async (file, directory = '') => {
    const targetDir = path_1.default.join(uploadsDir, directory);
    try {
        // Garante que o diretório existe
        await promises_1.default.mkdir(targetDir, { recursive: true });
        // Retorna apenas o nome do arquivo (sem o caminho completo)
        return path_1.default.join(directory, file.filename);
    }
    catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        throw new Error('Erro ao salvar arquivo');
    }
};
exports.uploadFile = uploadFile;
const deleteFile = async (filePath) => {
    try {
        const fullPath = path_1.default.join(uploadsDir, filePath);
        await promises_1.default.unlink(fullPath);
    }
    catch (error) {
        console.error('Erro ao excluir arquivo:', error);
        // Não lança erro se o arquivo não existir
    }
};
exports.deleteFile = deleteFile;
