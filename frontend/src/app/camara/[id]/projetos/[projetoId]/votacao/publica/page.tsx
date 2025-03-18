'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  autor: string;
  status: string;
  data_apresentacao: string;
  sessao_id: number;
  camara_id: number;
  created_at: string;
  updated_at: string;
}

interface Sessao {
  id: number;
  titulo: string;
  data: string;
  status: string;
  tipo: string;
}

interface Camara {
  id: number;
  nome: string;
  descricao: string;
  endereco: string;
  cidade: string;
  estado: string;
  imagem_url?: string;
  logo?: string;
}

interface Voto {
  id: number;
  projeto_id: number;
  vereador_id: number;
  tipo_voto: 'sim' | 'nao' | 'abster';
  created_at: string;
  vereador?: {
    name: string;
    partido: string;
    foto_url?: string;
  };
}

interface ContagemVotos {
  sim: number;
  nao: number;
  abster: number;
  total: number;
}

export default function VotacaoPublicaPage() {
  const params = useParams();
  const projetoId = params?.projetoId as string;
  const camaraId = params?.id as string;
  
  // Estados
  const [loading, setLoading] = useState(true);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [camara, setCamara] = useState<Camara | null>(null);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [vereadores, setVereadores] = useState<any[]>([]);
  const [contagem, setContagem] = useState<ContagemVotos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [presencas, setPresencas] = useState<any[]>([]);
  
  // Carrega dados iniciais
  useEffect(() => {
    if (!projetoId || !camaraId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carrega o projeto
        const projetoRes = await fetch(`/api/projetos/${projetoId}`);
        if (!projetoRes.ok) throw new Error('Erro ao carregar projeto');
        const projetoData = await projetoRes.json();
        setProjeto(projetoData);
        
        // Carrega a câmara
        const camaraRes = await fetch(`/api/camaras/${camaraId}`);
        if (!camaraRes.ok) throw new Error('Erro ao carregar dados da câmara');
        const camaraData = await camaraRes.json();
        console.log("Dados da câmara carregados:", camaraData);
        console.log("URL da imagem (logo):", camaraData.logo);
        setCamara(camaraData);
        
        // Carrega a sessão se houver sessao_id
        if (projetoData.sessao_id) {
          const sessaoRes = await fetch(`/api/sessoes/${projetoData.sessao_id}`);
          if (sessaoRes.ok) {
            const sessaoData = await sessaoRes.json();
            setSessao(sessaoData);
            
            // Carrega presenças da sessão
            const presencasRes = await fetch(`/api/sessoes/${projetoData.sessao_id}/presencas`);
            if (presencasRes.ok) {
              const presencasData = await presencasRes.json();
              setPresencas(presencasData.filter((p: any) => p.presente));
            }
          }
        }
        
        // Carrega lista de vereadores
        try {
          const vereadoresRes = await fetch(`/api/camaras/${camaraId}/vereadores`);
          if (vereadoresRes.ok) {
            const vereadoresData = await vereadoresRes.json();
            setVereadores(vereadoresData);
          }
        } catch (err) {
          console.error('Erro ao carregar vereadores:', err);
        }
        
        // Carrega os votos e contagem
        await carregarVotos();
        
      } catch (err: any) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Força o modo tela cheia ao carregar
    const requestFullScreen = () => {
      const doc = window.document as any;
      const docEl = doc.documentElement as any;
      
      const requestFullScreen = 
        docEl.requestFullscreen || 
        docEl.mozRequestFullScreen || 
        docEl.webkitRequestFullScreen || 
        docEl.msRequestFullscreen;
        
      if(requestFullScreen) {
        requestFullScreen.call(docEl);
      }
    };
    
    // Tenta entrar em modo tela cheia ao clicar na página
    document.addEventListener('click', requestFullScreen);
    
    return () => {
      document.removeEventListener('click', requestFullScreen);
    };
  }, [projetoId, camaraId]);
  
  // Atualização automática dos votos e relógio
  useEffect(() => {
    const votosTimer = setInterval(() => {
      carregarVotos();
    }, 10000);
    
    // Atualiza o relógio a cada segundo
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(votosTimer);
      clearInterval(clockTimer);
    };
  }, []);
  
  const carregarVotos = async () => {
    try {
      // Carrega os votos
      const votosRes = await fetch(`/api/projetos/${projetoId}/votos`);
      if (!votosRes.ok) {
        console.error('Erro ao carregar votos:', votosRes.statusText);
        return;
      }
      const votosData = await votosRes.json();
      setVotos(votosData);
      
      // Carrega a contagem
      const contagemRes = await fetch(`/api/projetos/${projetoId}/contagem-votos`);
      if (!contagemRes.ok) {
        console.error('Erro ao carregar contagem:', contagemRes.statusText);
        return;
      }
      const contagemData = await contagemRes.json();
      setContagem(contagemData);
    } catch (err: any) {
      console.error('Erro ao carregar votos:', err);
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APRESENTADO': return 'APRESENTADO';
      case 'EM_VOTACAO': return 'EM VOTAÇÃO';
      case 'APROVADO': return 'APROVADO';
      case 'REJEITADO': return 'REJEITADO';
      default: return status || '';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APROVADO': return 'text-green-500';
      case 'REJEITADO': return 'text-red-500';
      case 'EM_VOTACAO': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };
  
  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const padZero = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black z-[9999]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!projeto || !camara) {
    return (
      <div className="fixed inset-0 flex justify-center items-center h-screen bg-black text-white z-[9999]">
        <div className="text-center">
          <p className="text-xl">Não foi possível carregar as informações necessárias</p>
          <p className="text-red-500 mt-2">{error || "Erro desconhecido"}</p>
        </div>
      </div>
    );
  }
  
  // Calcula se o projeto está aprovado ou rejeitado com base na contagem
  const semVotos = !contagem || (contagem.total === 0);
  const isAprovado = contagem && contagem.sim > contagem.nao;
  const isRejeitado = contagem && contagem.nao >= contagem.sim && contagem.total > 0;
  
  let statusFinal;
  if (projeto.status === 'APROVADO' || isAprovado) {
    statusFinal = 'APROVADO';
  } else if (projeto.status === 'REJEITADO' || isRejeitado) {
    statusFinal = 'REJEITADO';
  } else if (semVotos) {
    statusFinal = 'VOTAÇÃO EM ANDAMENTO';
  } else {
    statusFinal = getStatusText(projeto.status);
  }
  
  // Combina vereadores com seus votos
  const vereadoresComVotos = vereadores.map(vereador => {
    const voto = votos.find(v => v.vereador_id === vereador.id);
    return {
      ...vereador,
      voto: voto ? voto.tipo_voto : null
    };
  });
  
  return (
    <div className="fixed inset-0 min-h-screen bg-black text-white flex flex-col z-[9999]">
      <style jsx global>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: black;
        }
        
        /* Remover qualquer elemento de UI indesejado */
        header, nav, aside, footer, 
        [role="navigation"], [role="complementary"],
        .sidebar, .navbar, .nav, .header, .footer {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          pointer-events: none !important;
        }
      `}</style>
      
      {/* Cabeçalho com Nome e Logo da Câmara */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="flex items-center justify-center gap-2">
          {/* Logo da Câmara */}
          <div className="relative h-24 w-36 flex items-center justify-center">
            {camara.logo ? (
              <div className="w-full h-full overflow-hidden">
                <img 
                  src={`http://localhost:3001/uploads/${camara.logo}`}
                  alt={camara.nome || "Câmara Municipal"}
                  className="w-full h-full object-contain"
                  onError={(e: any) => {
                    console.error("Erro ao carregar imagem:", camara.logo);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-transparent text-gray-300 text-2xl font-bold">${camara.nome?.substring(0, 2).toUpperCase() || "CM"}</div>`;
                  }}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-transparent text-gray-300 border-2 border-green-500 rounded-full">
                <span className="text-2xl font-bold">{camara.nome?.substring(0, 2).toUpperCase() || "CM"}</span>
              </div>
            )}
          </div>
          
          {/* Nome da Câmara */}
          <h1 className="text-5xl font-bold text-white uppercase">{camara.nome}</h1>
        </div>
        
        {/* Data e Hora da Sessão */}
        <div className="text-xl mt-2">
          {sessao ? (
            <>
              Sessão: {sessao.titulo} • {new Date(sessao.data).toLocaleDateString('pt-BR')} • {formatTimeDisplay(currentTime)}
            </>
          ) : (
            <>
              Data: {new Date().toLocaleDateString('pt-BR')} • Hora: {formatTimeDisplay(currentTime)}
            </>
          )}
        </div>
        
        {/* Linha separadora */}
        <div className="w-full h-0.5 bg-green-500 mt-4"></div>
      </div>
      
      {/* Informações do Projeto */}
      <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold text-white mb-2">
          {projeto.titulo || `PLO - ${projeto.id}/2023`}
        </h2>
        <p className="text-xl text-gray-300">
          Autor: {projeto.autor}
        </p>
      </div>
      
      {/* Lista de Vereadores */}
      <div className="p-6 bg-white rounded-lg mt-6">
        <h3 className="text-2xl font-bold text-white mb-4">Votos dos Vereadores</h3>
        
        {/* Presença dos vereadores */}
        {sessao && presencas.length > 0 && (
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-white mb-2">Vereadores Presentes na Sessão</h4>
            <div className="flex flex-wrap gap-2">
              {presencas.map((p: any) => (
                <div key={p.vereador_id} className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                  {p.vereador?.name || `Vereador ${p.vereador_id}`}
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {presencas.length} vereador{presencas.length !== 1 ? 'es' : ''} presente{presencas.length !== 1 ? 's' : ''} na sessão
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {votos.length > 0 ? (
            votos.map((voto) => (
              <div 
                key={voto.id}
                className="p-3 border rounded"
              >
                <p className={`text-xl font-bold ${
                  voto.tipo_voto === 'sim' ? 'text-green-500' : 
                  voto.tipo_voto === 'nao' ? 'text-red-500' : 
                  voto.tipo_voto === 'abster' ? 'text-gray-500' : 'text-white'
                }`}>
                  {voto.vereador?.name || `Vereador ID: ${voto.vereador_id}`}
                </p>
                <p className="text-sm text-gray-400">{voto.vereador?.partido || '-'}</p>
                <p className={`text-sm font-bold ${
                  voto.tipo_voto === 'sim' ? 'text-green-500' : 
                  voto.tipo_voto === 'nao' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {voto.tipo_voto === 'sim' ? 'SIM' : voto.tipo_voto === 'nao' ? 'NÃO' : 'ABSTENÇÃO'}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-xl text-gray-300">Nenhum voto registrado ainda.</p>
          )}
        </div>
      </div>
      
      {/* Contagem e Resultado */}
      <div className="border-t border-green-500 p-4">
        <div className="flex justify-around items-center">
          {contagem && (
            <>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">SIM</span>
                <span className="text-4xl font-bold text-green-500">{padZero(contagem.sim)}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">NÃO</span>
                <span className="text-4xl font-bold text-red-500">{padZero(contagem.nao)}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">ABSTENÇÃO</span>
                <span className="text-4xl font-bold text-gray-500">{padZero(contagem.abster)}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">RESULTADO</span>
                <span className={`text-4xl font-bold ${
                  isAprovado ? 'text-green-500' : 
                  isRejeitado ? 'text-red-500' : 
                  semVotos ? 'text-yellow-500' : 'text-gray-500'
                }`}>
                  {statusFinal}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 