import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { camaraId: string, projetoId: string } }
) {
  try {
    const { camaraId, projetoId } = params;
    
    // Buscando os dados do projeto
    const projetoRes = await fetch(`${api.projetos.get(projetoId)}`);
    if (!projetoRes.ok) throw new Error('Erro ao carregar projeto');
    const projeto = await projetoRes.json();
    
    // Buscando os dados da câmara
    const camaraRes = await fetch(`${api.camaras.get(camaraId)}`);
    if (!camaraRes.ok) throw new Error('Erro ao carregar dados da câmara');
    const camara = await camaraRes.json();
    
    // Buscando sessão, se houver
    let sessao = null;
    if (projeto.sessao_id) {
      const sessaoRes = await fetch(`${api.sessoes.get(projeto.sessao_id.toString())}`);
      if (sessaoRes.ok) {
        sessao = await sessaoRes.json();
      }
    }
    
    // Buscando votos
    const votosRes = await fetch(`${api.votos.listar(projetoId)}`);
    const votos = votosRes.ok ? await votosRes.json() : [];
    
    // Buscando contagem de votos
    const contagemRes = await fetch(`${api.votos.contagem(projetoId)}`);
    const contagem = contagemRes.ok ? await contagemRes.json() : { sim: 0, nao: 0, abster: 0, total: 0 };
    
    // Função para formatar a hora atual
    function formatTimeDisplay(date: Date): string {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    
    // HTML do painel de votação
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel de Votação - ${projeto.titulo}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: black;
            color: white;
            overflow: hidden;
            height: 100vh;
            width: 100vw;
          }
          
          .status-aprovado { color: #10B981; }
          .status-rejeitado { color: #EF4444; }
          .status-emvotacao { color: #F59E0B; }
          
          .voto-sim { border-color: #10B981; background-color: rgba(16, 185, 129, 0.1); }
          .voto-nao { border-color: #EF4444; background-color: rgba(239, 68, 68, 0.1); }
          .voto-abster { border-color: #6B7280; background-color: rgba(107, 114, 128, 0.1); }
          
          .texto-sim { color: #10B981; }
          .texto-nao { color: #EF4444; }
          .texto-abster { color: #6B7280; }
          
          .contador { font-size: 3rem; font-weight: bold; }
          
          #relogio {
            position: fixed;
            bottom: 1rem;
            right: 1.5rem;
            font-size: 2.5rem;
            font-family: monospace;
            font-weight: bold;
          }
          
          .box-vereador {
            min-height: 5rem;
            transition: all 0.3s ease;
          }
          
          .box-vereador:hover {
            transform: scale(1.03);
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          .votacao-ativa {
            animation: pulse 2s infinite;
          }
        </style>
      </head>
      <body>
        <div class="min-h-screen bg-black text-white flex flex-col">
          <!-- Cabeçalho -->
          <div class="border border-green-500 p-2">
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <!-- Data -->
                <div class="text-xl font-bold">
                  ${sessao ? new Date(sessao.data).toLocaleDateString('pt-BR') : ''}
                </div>
              </div>
              
              <!-- Título da sessão -->
              <div class="text-xl font-bold uppercase">
                ${sessao ? `SESSÃO ${(sessao.tipo || 'ORDINÁRIA').toUpperCase()} • ${(sessao.titulo.split(' ').pop() || '')}` : 'SESSÃO'}
              </div>
              
              <!-- Resultado -->
              <div class="bg-green-500 text-white px-8 py-2 rounded">
                <span class="text-xl font-bold">RESULTADO</span>
              </div>
            </div>
          </div>
          
          <!-- Conteúdo principal -->
          <div class="flex-1 flex flex-col">
            <div class="flex mb-4 mt-4">
              <!-- Logo da Câmara -->
              <div class="w-1/4 flex justify-center items-start p-6">
                <div class="relative h-40 w-40 flex items-center justify-center">
                  ${camara.imagem_url ? 
                    `<img src="${camara.imagem_url}" alt="${camara.nome}" class="max-w-full max-h-full" />` : 
                    `<div class="flex h-full w-full items-center justify-center bg-transparent text-gray-500 border border-gray-700 rounded-full">Logo</div>`
                  }
                </div>
              </div>
              
              <!-- Identificação e status do projeto -->
              <div class="w-1/2 flex flex-col items-center justify-center">
                <div class="text-3xl mb-2 font-bold text-center">
                  PLO - ${projeto.id}/2023 <span class="text-lg ml-2">MAIORIA SIMPLES</span>
                </div>
                
                <div class="text-8xl font-bold mt-4 ${getStatusClass(projeto.status, contagem)}">
                  ${getStatusText(projeto.status, contagem)}
                </div>
              </div>
              
              <!-- Contagem de votos -->
              <div class="w-1/4 flex flex-col justify-center items-center">
                <div class="flex flex-col items-center mb-6">
                  <div class="text-2xl font-bold">SIM</div>
                  <div class="bg-green-500 text-white px-8 py-2 rounded w-40 text-center">
                    <span class="text-5xl font-bold">${padZero(contagem.sim)}</span>
                  </div>
                </div>
                
                <div class="flex flex-col items-center">
                  <div class="text-2xl font-bold">NÃO</div>
                  <div class="bg-red-500 text-white px-8 py-2 rounded w-40 text-center">
                    <span class="text-5xl font-bold">${padZero(contagem.nao)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Grid de votação dos vereadores -->
            <div class="grid grid-cols-4 md:grid-cols-5 gap-3 p-6">
              ${renderVotos(votos)}
            </div>
          </div>
          
          <!-- Relógio -->
          <div id="relogio">${formatTimeDisplay(new Date())}</div>
        </div>
        
        <script>
          // Atualizar relógio a cada segundo
          setInterval(() => {
            const now = new Date();
            document.getElementById('relogio').textContent = formatTimeDisplay(now);
          }, 1000);
          
          // Atualizar o painel automaticamente
          setInterval(() => {
            location.reload();
          }, 10000);
          
          function formatTimeDisplay(date) {
            return date.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            });
          }
          
          // Solicitar tela cheia ao clicar
          document.addEventListener('click', () => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.log('Erro ao tentar entrar em tela cheia:', err);
              });
            }
          });
        </script>
      </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
  } catch (error: any) {
    console.error('Erro ao renderizar painel de votação:', error);
    
    // Retorna página de erro
    const errorHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro</title>
        <style>
          body { background: black; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .error { text-align: center; }
          .message { color: #EF4444; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>Não foi possível carregar o painel de votação</h1>
          <p class="message">${error.message || 'Erro desconhecido'}</p>
        </div>
      </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }
}

// Funções auxiliares para gerar o HTML
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function getStatusText(status: string, contagem: any): string {
  if (status === 'APROVADO') return 'APROVADO';
  if (status === 'REJEITADO') return 'REJEITADO';
  
  // Se estiver em votação, calcular com base na contagem
  if (status === 'EM_VOTACAO') {
    if (contagem && contagem.sim > contagem.nao) return 'APROVADO';
    if (contagem && contagem.nao >= contagem.sim) return 'REJEITADO';
    return 'EM VOTAÇÃO';
  }
  
  if (status === 'APRESENTADO') return 'APRESENTADO';
  return status || '';
}

function getStatusClass(status: string, contagem: any): string {
  if (status === 'APROVADO') return 'status-aprovado';
  if (status === 'REJEITADO') return 'status-rejeitado';
  
  // Se estiver em votação, calcular com base na contagem
  if (status === 'EM_VOTACAO') {
    if (contagem && contagem.sim > contagem.nao) return 'status-aprovado';
    if (contagem && contagem.nao >= contagem.sim) return 'status-rejeitado';
    return 'status-emvotacao votacao-ativa';
  }
  
  return 'text-gray-500';
}

function renderVotos(votos: any[]): string {
  if (!votos || votos.length === 0) {
    return `<div class="col-span-4 text-center p-4 text-gray-400">Nenhum voto registrado ainda.</div>`;
  }
  
  return votos.map(voto => {
    const votoClass = voto.tipo_voto === 'sim' ? 'voto-sim' : 
                     voto.tipo_voto === 'nao' ? 'voto-nao' : 'voto-abster';
    
    const textoClass = voto.tipo_voto === 'sim' ? 'texto-sim' : 
                      voto.tipo_voto === 'nao' ? 'texto-nao' : 'texto-abster';
                      
    const votoTexto = voto.tipo_voto === 'sim' ? 'SIM' : 
                     voto.tipo_voto === 'nao' ? 'NÃO' : 'ABSTENÇÃO';
    
    return `
      <div class="flex items-center border-2 ${votoClass} rounded-md p-2 box-vereador">
        <div class="relative h-14 w-14 overflow-hidden rounded-full mr-3 bg-gray-800 flex items-center justify-center">
          ${voto.vereador?.foto_url ? 
            `<img src="${voto.vereador.foto_url}" alt="${voto.vereador.name}" class="w-full h-full object-cover" />` : 
            `<div class="text-gray-500">Foto</div>`
          }
        </div>
        <div class="flex-1">
          <div class="font-bold ${textoClass}">
            ${voto.vereador?.name || `Vereador ID: ${voto.vereador_id}`}
          </div>
          <div class="text-sm text-gray-400">${voto.vereador?.partido || '-'}</div>
          <div class="text-xs ${textoClass} uppercase font-bold mt-1">
            ${votoTexto}
          </div>
        </div>
      </div>
    `;
  }).join('');
} 