"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessoesController_1 = __importDefault(require("../controllers/sessoesController"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Aplica o middleware de autenticação em todas as rotas
router.use(auth_1.authMiddleware);
// Rotas
router.get('/', sessoesController_1.default.index);
router.post('/', sessoesController_1.default.create);
router.get('/:id', sessoesController_1.default.show);
router.put('/:id', sessoesController_1.default.update);
router.delete('/:id', sessoesController_1.default.delete);
// Novas rotas para controle de status da sessão
router.post('/:id/iniciar', sessoesController_1.default.iniciar);
router.post('/:id/finalizar', sessoesController_1.default.finalizar);
router.post('/:id/cancelar', sessoesController_1.default.cancelar);
exports.default = router;
