"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function corrigirPresidente() {
    try {
        console.log('Iniciando correção dos presidentes...');
        // 1. Listar todos os usuários com cargo "Presidente" mas sem role "admin"
        const resultado = await database_1.default.query(`
      SELECT u.id, u.name, u.email, u.role, u.cargo, c.id as camara_id, c.nome as camara_nome
      FROM users u
      JOIN camaras c ON u.camara_id = c.id
      WHERE LOWER(u.cargo) = 'presidente' AND u.role != 'admin'
    `);
        console.log(`Encontrados ${resultado.rows.length} presidentes para corrigir`);
        // 2. Para cada câmara, garantir que apenas um usuário seja presidente/admin
        const camaras = new Set(resultado.rows.map(row => row.camara_id));
        for (const camaraId of camaras) {
            // Encontrar os presidentes desta câmara
            const presidentesDaCamara = resultado.rows.filter(row => row.camara_id === camaraId);
            if (presidentesDaCamara.length > 0) {
                // Pegar o primeiro presidente para ser o admin
                const presidenteParaPromover = presidentesDaCamara[0];
                console.log(`Promovendo presidente ${presidenteParaPromover.name} (ID: ${presidenteParaPromover.id}) da câmara ${presidenteParaPromover.camara_nome} para admin`);
                // Revogar admin de todos os outros usuários da câmara
                await database_1.default.query(`
          UPDATE users 
          SET role = 'vereador' 
          WHERE camara_id = $1 AND role = 'admin'
        `, [camaraId]);
                // Promover o presidente para admin
                await database_1.default.query(`
          UPDATE users 
          SET role = 'admin' 
          WHERE id = $1
        `, [presidenteParaPromover.id]);
                // Verificar as senhas dos presidentes para garantir que estão corretas
                const senhaPadrao = '123456';
                const hashedPassword = await bcrypt_1.default.hash(senhaPadrao, 10);
                // Atualizar a senha do presidente para a senha padrão
                await database_1.default.query(`
          UPDATE users 
          SET password = $1 
          WHERE id = $2
        `, [hashedPassword, presidenteParaPromover.id]);
                console.log(`Senha do presidente ${presidenteParaPromover.name} redefinida para '123456'`);
                console.log(`Email para login: ${presidenteParaPromover.email}`);
            }
        }
        // 3. Listar todos os usuários com cargo "Presidente" após as correções
        const resultadoFinal = await database_1.default.query(`
      SELECT u.id, u.name, u.email, u.role, u.cargo, c.nome as camara_nome
      FROM users u
      JOIN camaras c ON u.camara_id = c.id
      WHERE LOWER(u.cargo) = 'presidente'
      ORDER BY c.nome
    `);
        console.log('\nPresidentes após correções:');
        resultadoFinal.rows.forEach(row => {
            console.log(`- ${row.name} (${row.email}) | Câmara: ${row.camara_nome} | Role: ${row.role}`);
        });
        console.log('\nProcesso concluído com sucesso!');
        process.exit(0);
    }
    catch (error) {
        console.error('Erro ao corrigir presidentes:', error);
        process.exit(1);
    }
}
// Executar a função
corrigirPresidente();
