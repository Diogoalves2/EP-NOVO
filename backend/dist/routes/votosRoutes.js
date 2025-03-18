"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VotoController_1 = __importDefault(require("../controllers/VotoController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
// Rotas públicas para visualização dos votos
router.get('/projetos/:projeto_id/votos', VotoController_1.default.listarVotos);
router.get('/projetos/:projeto_id/contagem-votos', VotoController_1.default.contarVotos);
// Rotas protegidas que exigem autenticação
router.use(authMiddleware_1.default);
// Rota para registrar um voto (apenas vereadores autenticados)
router.post('/projetos/:projeto_id/votos', VotoController_1.default.registrarVoto);
// Rotas para controle de votação (apenas admin)
router.post('/projetos/:projeto_id/iniciar-votacao', VotoController_1.default.iniciarVotacao);
router.post('/projetos/:projeto_id/finalizar-votacao', VotoController_1.default.finalizarVotacao);
exports.default = router;
