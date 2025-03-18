"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
dotenv_1.default.config();
async function createSuperAdmin() {
    try {
        console.log('Verificando se super admin já existe...');
        const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME } = process.env;
        if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD || !SUPER_ADMIN_NAME) {
            console.error('Erro: Variáveis de ambiente para super admin não configuradas');
            process.exit(1);
        }
        // Verifica se já existe um super admin
        const existingAdmin = await User_1.PostgresUserModel.findByEmail(SUPER_ADMIN_EMAIL);
        if (existingAdmin) {
            console.log('Super admin já existe!');
            process.exit(0);
        }
        // Cria o super admin
        console.log('Criando super admin...');
        const superAdmin = await User_1.PostgresUserModel.create({
            name: SUPER_ADMIN_NAME,
            email: SUPER_ADMIN_EMAIL,
            password: SUPER_ADMIN_PASSWORD,
            role: 'super_admin'
        });
        console.log('Super admin criado com sucesso!');
        console.log('Email:', superAdmin.email);
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao criar super admin:', error);
        process.exit(1);
    }
}
createSuperAdmin();
