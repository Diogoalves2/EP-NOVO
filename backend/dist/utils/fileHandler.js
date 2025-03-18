"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const unlinkAsync = (0, util_1.promisify)(fs_1.default.unlink);
const UPLOAD_DIR = path_1.default.join(__dirname, '../../uploads');
// Garante que o diretório de uploads existe
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
async function uploadFile(file) {
    try {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname.replace(/\s+/g, '')}`;
        const filepath = path_1.default.join(UPLOAD_DIR, filename);
        // Move o arquivo para o diretório de uploads
        await fs_1.default.promises.writeFile(filepath, file.buffer);
        // Retorna o caminho relativo do arquivo
        return filename;
    }
    catch (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        throw new Error('Erro ao fazer upload do arquivo');
    }
}
async function deleteFile(filename) {
    try {
        const filepath = path_1.default.join(UPLOAD_DIR, filename);
        // Verifica se o arquivo existe antes de tentar deletar
        if (fs_1.default.existsSync(filepath)) {
            await unlinkAsync(filepath);
        }
    }
    catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        throw new Error('Erro ao deletar arquivo');
    }
}
