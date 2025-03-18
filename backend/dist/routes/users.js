"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const UserController_1 = require("../controllers/UserController");
const auth_1 = require("../middlewares/auth");
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Criar diretório uploads se não existir
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configuração do Multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = (0, uuid_1.v4)();
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'foto') {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Por favor, envie apenas imagens jpg, jpeg ou png.'));
        }
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
// Middleware de autenticação para todas as rotas
router.use(auth_1.authMiddleware);
// Rotas
router.get('/', UserController_1.UserController.index);
router.get('/:id', UserController_1.UserController.show);
router.post('/', upload.single('foto'), UserController_1.UserController.create);
router.put('/:id', upload.single('foto'), UserController_1.UserController.update);
router.delete('/:id', UserController_1.UserController.delete);
exports.default = router;
