"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SessaoController_1 = __importDefault(require("../controllers/SessaoController"));
const auth_1 = require("../middlewares/auth");
const sessoesRouter = (0, express_1.Router)();
// Aplica o middleware de autenticação em todas as rotas
sessoesRouter.use(auth_1.authMiddleware);
// Rotas
sessoesRouter.get('/', SessaoController_1.default.index);
sessoesRouter.post('/', SessaoController_1.default.create);
sessoesRouter.get('/:id', SessaoController_1.default.show);
sessoesRouter.put('/:id', SessaoController_1.default.update);
sessoesRouter.delete('/:id', SessaoController_1.default.delete);
exports.default = sessoesRouter;
