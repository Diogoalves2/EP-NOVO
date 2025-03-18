"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjetoController_1 = __importDefault(require("./controllers/ProjetoController"));
const SessaoController_1 = __importDefault(require("./controllers/SessaoController"));
const VotoController_1 = __importDefault(require("./controllers/VotoController"));
const PresencaController_1 = __importDefault(require("./controllers/PresencaController"));
const authMiddleware_1 = __importDefault(require("./middlewares/authMiddleware"));
const CamaraController_1 = require("./controllers/CamaraController");
const router = (0, express_1.Router)();
// Rotas para câmaras
router.get('/camaras', CamaraController_1.CamaraController.index);
router.get('/camaras/:id', CamaraController_1.CamaraController.show);
router.post('/camaras', authMiddleware_1.default, CamaraController_1.CamaraController.create);
router.put('/camaras/:id', authMiddleware_1.default, CamaraController_1.CamaraController.update);
router.delete('/camaras/:id', authMiddleware_1.default, CamaraController_1.CamaraController.delete);
// Rotas para projetos
router.get('/projetos', ProjetoController_1.default.index.bind(ProjetoController_1.default));
router.get('/projetos/:id', ProjetoController_1.default.show.bind(ProjetoController_1.default));
router.post('/projetos', authMiddleware_1.default, ProjetoController_1.default.create.bind(ProjetoController_1.default));
router.put('/projetos/:id', authMiddleware_1.default, ProjetoController_1.default.update.bind(ProjetoController_1.default));
router.delete('/projetos/:id', authMiddleware_1.default, ProjetoController_1.default.delete.bind(ProjetoController_1.default));
// Rotas para votação
router.post('/projetos/:id/iniciar-votacao', authMiddleware_1.default, VotoController_1.default.iniciarVotacao.bind(VotoController_1.default));
router.post('/projetos/:id/finalizar-votacao', authMiddleware_1.default, VotoController_1.default.finalizarVotacao.bind(VotoController_1.default));
router.post('/projetos/:id/votar', authMiddleware_1.default, VotoController_1.default.registrarVoto.bind(VotoController_1.default));
router.get('/projetos/:id/votos', VotoController_1.default.listarVotos.bind(VotoController_1.default));
router.get('/projetos/:id/contagem-votos', VotoController_1.default.contarVotos.bind(VotoController_1.default));
// Rotas para sessões
router.get('/sessoes', SessaoController_1.default.index.bind(SessaoController_1.default));
router.get('/sessoes/:id', SessaoController_1.default.show.bind(SessaoController_1.default));
router.post('/sessoes', authMiddleware_1.default, SessaoController_1.default.create.bind(SessaoController_1.default));
router.put('/sessoes/:id', authMiddleware_1.default, SessaoController_1.default.update.bind(SessaoController_1.default));
router.delete('/sessoes/:id', authMiddleware_1.default, SessaoController_1.default.delete.bind(SessaoController_1.default));
router.post('/sessoes/:id/iniciar', authMiddleware_1.default, SessaoController_1.default.iniciar.bind(SessaoController_1.default));
router.post('/sessoes/:id/finalizar', authMiddleware_1.default, SessaoController_1.default.finalizar.bind(SessaoController_1.default));
router.post('/sessoes/:id/cancelar', authMiddleware_1.default, SessaoController_1.default.cancelar.bind(SessaoController_1.default));
// Rotas de presença
router.get('/sessoes/:sessaoId/presencas', PresencaController_1.default.listarPresencasPorSessao.bind(PresencaController_1.default));
router.get('/sessoes/:sessaoId/presentes', PresencaController_1.default.listarPresentes.bind(PresencaController_1.default));
router.get('/sessoes/:sessaoId/presencas/contagem', PresencaController_1.default.contarPresencas.bind(PresencaController_1.default));
router.post('/sessoes/:sessaoId/vereadores/:vereadorId/presenca', authMiddleware_1.default, PresencaController_1.default.registrarPresenca.bind(PresencaController_1.default));
router.get('/sessoes/:sessaoId/vereadores/:vereadorId/presenca', PresencaController_1.default.verificarPresenca.bind(PresencaController_1.default));
router.post('/sessoes/:sessaoId/presencas/todos-presentes', authMiddleware_1.default, PresencaController_1.default.marcarTodosPresentes.bind(PresencaController_1.default));
router.post('/sessoes/:sessaoId/presencas/todos-ausentes', authMiddleware_1.default, PresencaController_1.default.marcarTodosAusentes.bind(PresencaController_1.default));
exports.default = router;
