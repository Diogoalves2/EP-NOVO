import { Router } from 'express';
import projetoController from './controllers/ProjetoController';
import sessaoController from './controllers/SessaoController';
import votoController from './controllers/VotoController';
import presencaController from './controllers/PresencaController';
import authMiddleware from './middlewares/authMiddleware';
import { CamaraController } from './controllers/CamaraController';
import userRoutes from './routes/users';
import { UserController } from './controllers/UserController';
import pool from './database';
import configuracoesController from './controllers/configuracoesController';

const router = Router();

// Rotas para usuários
router.use('/users', userRoutes);

// Rota específica para listar vereadores por câmara - sem exigir autenticação
router.get('/camaras/:id/vereadores', UserController.findByCamaraId);

// Rotas para configurações
router.get('/configuracoes', authMiddleware, configuracoesController.index);
router.put('/configuracoes', authMiddleware, configuracoesController.update);

// Rota do dashboard para estatísticas
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    // Contagem de câmaras ativas
    const camarasQuery = await pool.query(
      'SELECT COUNT(*) as count FROM camaras'
    );
    const camaras_ativas = parseInt(camarasQuery.rows[0].count) || 0;
    
    // Contagem de votações em andamento
    const votacoesEmAndamentoQuery = await pool.query(
      'SELECT COUNT(*) as count FROM projetos WHERE status = $1',
      ['em_votacao']
    );
    const votacoes_em_andamento = parseInt(votacoesEmAndamentoQuery.rows[0].count) || 0;
    
    // Contagem de votações finalizadas
    const votacoesFinalizadasQuery = await pool.query(
      'SELECT COUNT(*) as count FROM projetos WHERE status = $1 OR status = $2',
      ['aprovado', 'rejeitado']
    );
    const votacoes_finalizadas = parseInt(votacoesFinalizadasQuery.rows[0].count) || 0;
    
    // Retorna os dados reais
    const stats = {
      camaras_ativas,
      votacoes_em_andamento,
      votacoes_finalizadas
    };
    
    return res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas do dashboard:', error);
    return res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Rotas para câmaras
router.get('/camaras', CamaraController.index);
router.get('/camaras/:id', CamaraController.show);
router.post('/camaras', authMiddleware, CamaraController.create);
router.put('/camaras/:id', authMiddleware, CamaraController.update);
router.delete('/camaras/:id', authMiddleware, CamaraController.delete);

// Rotas dedicadas para uploads de arquivos de câmaras
router.post('/camaras/:id/logo', authMiddleware, CamaraController.updateLogo);
router.post('/camaras/:id/regimento', authMiddleware, CamaraController.updateRegimento);

// Rotas para projetos
router.get('/projetos', projetoController.index.bind(projetoController));
router.get('/projetos/:id', projetoController.show.bind(projetoController));
router.post('/projetos', authMiddleware, projetoController.create.bind(projetoController));
router.put('/projetos/:id', authMiddleware, projetoController.update.bind(projetoController));
router.delete('/projetos/:id', authMiddleware, projetoController.delete.bind(projetoController));

// Rotas para votação
router.post('/projetos/:id/iniciar-votacao', authMiddleware, votoController.iniciarVotacao.bind(votoController));
router.post('/projetos/:id/finalizar-votacao', authMiddleware, votoController.finalizarVotacao.bind(votoController));
router.post('/projetos/:id/votar', authMiddleware, votoController.registrarVoto.bind(votoController));
router.get('/projetos/:id/votos', votoController.listarVotos.bind(votoController));
router.get('/projetos/:id/contagem-votos', votoController.contarVotos.bind(votoController));

// Rotas para sessões
router.get('/sessoes', sessaoController.index.bind(sessaoController));
router.get('/sessoes/:id', sessaoController.show.bind(sessaoController));
router.post('/sessoes', authMiddleware, sessaoController.create.bind(sessaoController));
router.put('/sessoes/:id', authMiddleware, sessaoController.update.bind(sessaoController));
router.delete('/sessoes/:id', authMiddleware, sessaoController.delete.bind(sessaoController));
router.post('/sessoes/:id/iniciar', authMiddleware, sessaoController.iniciar.bind(sessaoController));
router.post('/sessoes/:id/finalizar', authMiddleware, sessaoController.finalizar.bind(sessaoController));
router.post('/sessoes/:id/cancelar', authMiddleware, sessaoController.cancelar.bind(sessaoController));

// Rotas de presença
router.get('/sessoes/:sessaoId/presencas', presencaController.listarPresencasPorSessao.bind(presencaController));
router.get('/sessoes/:sessaoId/presentes', presencaController.listarPresentes.bind(presencaController));
router.get('/sessoes/:sessaoId/presencas/contagem', presencaController.contarPresencas.bind(presencaController));
router.post('/sessoes/:sessaoId/vereadores/:vereadorId/presenca', authMiddleware, presencaController.registrarPresenca.bind(presencaController));
router.get('/sessoes/:sessaoId/vereadores/:vereadorId/presenca', presencaController.verificarPresenca.bind(presencaController));
router.post('/sessoes/:sessaoId/presencas/todos-presentes', authMiddleware, presencaController.marcarTodosPresentes.bind(presencaController));
router.post('/sessoes/:sessaoId/presencas/todos-ausentes', authMiddleware, presencaController.marcarTodosAusentes.bind(presencaController));

// Rota para estatísticas de uma câmara específica
router.get('/camaras/:id/stats', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'ID da câmara inválido' });
    }

    // Consultar dados reais da câmara no banco de dados
    const camaraExists = await pool.query('SELECT id FROM camaras WHERE id = $1', [id]);

    if (camaraExists.rows.length === 0) {
      return res.status(404).json({ error: 'Câmara não encontrada' });
    }

    // Consultar estatísticas reais no banco de dados
    const vereadores = await pool.query('SELECT COUNT(*) as count FROM users WHERE camara_id = $1 AND role = $2', [id, 'vereador']);
    const sessoes = await pool.query('SELECT COUNT(*) as count FROM sessoes WHERE camara_id = $1 AND status = $2', [id, 'finalizada']);
    const projetos = await pool.query('SELECT COUNT(*) as count FROM projetos WHERE camara_id = $1 AND status = $2', [id, 'apresentado']);

    // Retornar as estatísticas
    const stats = {
      vereadores_ativos: parseInt(vereadores.rows[0].count) || 0,
      sessoes_realizadas: parseInt(sessoes.rows[0].count) || 0,
      projetos_em_tramitacao: parseInt(projetos.rows[0].count) || 0
    };

    console.log(`Estatísticas da câmara ${id}:`, stats);
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas da câmara:', error);
    return res.status(500).json({ error: 'Erro ao buscar estatísticas da câmara' });
  }
});

export default router; 