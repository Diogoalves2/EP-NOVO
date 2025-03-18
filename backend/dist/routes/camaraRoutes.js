"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Camara_1 = require("../models/Camara");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// Garantir que o diretório de uploads existe
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configuração do Multer para upload de arquivos
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'logo' || file.fieldname.startsWith('foto_vereador_')) {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('Apenas imagens são permitidas para logo e fotos de vereadores'));
            }
        }
        else if (file.fieldname === 'regimentoInterno') {
            if (file.mimetype !== 'application/pdf') {
                return cb(new Error('O regimento interno deve ser um arquivo PDF'));
            }
        }
        cb(null, true);
    }
});
// Função para validar os dados da câmara
const validarDadosCamara = (data) => {
    const camposObrigatorios = ['nome', 'endereco', 'cidade', 'estado', 'cep', 'telefone', 'email'];
    const camposFaltando = camposObrigatorios.filter(campo => !data[campo]);
    if (camposFaltando.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
    }
    if (!Array.isArray(data.vereadores) || data.vereadores.length === 0) {
        throw new Error('É necessário incluir pelo menos um vereador');
    }
    data.vereadores.forEach((vereador, index) => {
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
router.post('/', upload.fields(uploadFields), async (req, res) => {
    var _a, _b;
    try {
        const files = req.files;
        if (!((_a = files === null || files === void 0 ? void 0 : files.logo) === null || _a === void 0 ? void 0 : _a[0])) {
            return res.status(400).json({ error: 'O logo da câmara é obrigatório' });
        }
        if (!((_b = files === null || files === void 0 ? void 0 : files.regimentoInterno) === null || _b === void 0 ? void 0 : _b[0])) {
            return res.status(400).json({ error: 'O regimento interno é obrigatório' });
        }
        const vereadores = JSON.parse(req.body.vereadores);
        const camaraData = Object.assign(Object.assign({}, req.body), { logo: files.logo[0].filename, regimentoInterno: files.regimentoInterno[0].filename, vereadores: vereadores.map((vereador, index) => {
                var _a, _b;
                return (Object.assign(Object.assign({}, vereador), { foto: vereador.foto ? (_b = (_a = files[`foto_vereador_${index}`]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.filename : undefined }));
            }) });
        // Validar dados antes de criar
        validarDadosCamara(camaraData);
        const camara = await Camara_1.PostgresCamaraModel.create(camaraData);
        res.status(201).json(camara);
    }
    catch (error) {
        console.error('Erro ao criar câmara:', error);
        // Remover arquivos enviados em caso de erro
        if (req.files) {
            const files = req.files;
            Object.values(files).flat().forEach(file => {
                fs_1.default.unlink(file.path, (err) => {
                    if (err)
                        console.error('Erro ao remover arquivo:', err);
                });
            });
        }
        // Retornar mensagem de erro apropriada
        res.status(400).json({
            error: error.message || 'Erro ao criar câmara',
            details: error.errors ? Object.values(error.errors).map((err) => err.message) : undefined
        });
    }
});
// Rota para listar todas as câmaras
router.get('/', async (_req, res) => {
    try {
        const camaras = await Camara_1.PostgresCamaraModel.findAll();
        res.json(camaras);
    }
    catch (error) {
        console.error('Erro ao listar câmaras:', error);
        res.status(500).json({ error: 'Erro ao listar câmaras' });
    }
});
// Rota para buscar uma câmara específica
router.get('/:id', async (req, res) => {
    try {
        const camara = await Camara_1.PostgresCamaraModel.findById(Number(req.params.id));
        if (!camara) {
            return res.status(404).json({ error: 'Câmara não encontrada' });
        }
        res.json(camara);
    }
    catch (error) {
        console.error('Erro ao buscar câmara:', error);
        res.status(500).json({ error: 'Erro ao buscar câmara' });
    }
});
exports.default = router;
