"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
async function updatePresidenteToAdmin() {
    try {
        console.log('Iniciando atualização de vereadores com cargo Presidente para role admin...');
        // Buscar todos os usuários com cargo "Presidente" que ainda têm role "vereador"
        const result = await database_1.default.query(`
      SELECT * FROM users 
      WHERE cargo = 'Presidente' AND role = 'vereador'
    `);
        const presidentes = result.rows;
        console.log(`Encontrados ${presidentes.length} presidentes para atualizar.`);
        // Atualizar cada um deles para role "admin"
        for (const presidente of presidentes) {
            await database_1.default.query(`
        UPDATE users 
        SET role = 'admin' 
        WHERE id = $1
      `, [presidente.id]);
            console.log(`Usuário ID ${presidente.id} (${presidente.name}) atualizado para admin.`);
        }
        console.log('Atualização concluída com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao atualizar presidentes:', error);
        process.exit(1);
    }
}
// Executar a função
updatePresidenteToAdmin();
