"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProjetoController_1 = __importDefault(require("../controllers/ProjetoController"));
const router = (0, express_1.Router)();
// Comentando o middleware de autenticação temporariamente para testes
// router.use(authMiddleware);
// Rotas para projetos
router.get('/', ProjetoController_1.default.index);
router.post('/', ProjetoController_1.default.create);
router.get('/:id', ProjetoController_1.default.show);
router.put('/:id', ProjetoController_1.default.update);
router.delete('/:id', ProjetoController_1.default.delete);
exports.default = router;
