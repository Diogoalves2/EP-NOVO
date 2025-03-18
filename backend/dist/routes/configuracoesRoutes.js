"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configuracoesController_1 = __importDefault(require("../controllers/configuracoesController"));
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
// Aplica o middleware de autenticação em todas as rotas
router.use(auth_1.authMiddleware);
// Rotas
router.get('/', configuracoesController_1.default.index);
router.put('/', upload_1.upload.single('logo'), configuracoesController_1.default.update);
exports.default = router;
