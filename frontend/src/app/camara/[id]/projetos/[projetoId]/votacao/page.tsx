'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, isAuthenticated, User } from '@/config/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Interfaces
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

interface Voto {
  id: number;
  projeto_id: number;
  vereador_id: number;
  tipo_voto: 'sim' | 'nao' | 'abster';
  created_at: string;
  vereador?: {
    name: string;
    partido: string;
  };
}

interface ContagemVotos {
  sim: number;
  nao: number;
  abster: number;
  total: number;
}

export default function VotacaoProjetoPage() {
  const params = useParams();
  const router = useRouter();
  const projetoId = params?.projetoId as string;
  const camaraId = params?.id as string;
  
  // Estado para autenticação
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Estado para o projeto
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [contagem, setContagem] = useState<ContagemVotos | null>(null);
  const [meuVoto, setMeuVoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [vereadorPresente, setVereadorPresente] = useState<boolean>(false);
  const [verificandoPresenca, setVerificandoPresenca] = useState<boolean>(false);
  
  // Define os papéis do usuário
  const isAdmin = user?.role === 'admin';
  const isVereador = user?.role === 'vereador';
  const userAuthenticated = isAuthenticated();
  const isEmVotacao = projeto?.status === 'EM_VOTACAO';
  const isFinalizado = projeto?.status === 'APROVADO' || projeto?.status === 'REJEITADO';
  const podeVotar = isVereador && isEmVotacao && vereadorPresente;
  
  // Temporizador para atualização automática
  const [tempoAteSincronizacao, setTempoAteSincronizacao] = useState(10);

  // Carrega as informações do usuário
  useEffect(() => {
    // Não prosseguir se não houver ID do projeto
    if (!projetoId) return;

    const loadUser = () => {
      try {
        const userData = getUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Carrega os dados do projeto
  useEffect(() => {
    if (authLoading || !projetoId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carrega o projeto
        const projetoRes = await fetch(`/api/projetos/${projetoId}`);
        if (!projetoRes.ok) {
          throw new Error('Erro ao carregar projeto');
        }
        const projetoData = await projetoRes.json();
        setProjeto(projetoData);
        
        // Carrega os votos
        await carregarVotos();
        
        // Verifica a presença do vereador se tiver sessão associada e for um vereador
        if (projetoData.sessao_id && isVereador && user) {
          await verificarPresencaVereador(projetoData.sessao_id, user.id);
        }
        
      } catch (err: any) {
        console.error('Erro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authLoading, projetoId, isVereador, user]);
  
  // Verifica se o usuário já votou
  useEffect(() => {
    if (user && votos.length > 0) {
      const meuVotoExistente = votos.find(v => v.vereador_id === user.id);
      if (meuVotoExistente) {
        setMeuVoto(meuVotoExistente.tipo_voto);
      }
    }
  }, [user, votos]);
  
  // Atualização automática dos votos
  useEffect(() => {
    if (isEmVotacao) {
      const timer = setInterval(() => {
        setTempoAteSincronizacao(prev => {
          if (prev <= 1) {
            carregarVotos();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isEmVotacao, projetoId]);
  
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
  
  const iniciarVotacao = async () => {
    if (!isAdmin) return;
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projetos/${projetoId}/iniciar-votacao`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao iniciar votação');
      }
      
      setProjeto(data);
      setMessage('Votação iniciada com sucesso!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao iniciar votação:', err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const finalizarVotacao = async () => {
    if (!isAdmin) return;
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projetos/${projetoId}/finalizar-votacao`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao finalizar votação');
      }
      
      setProjeto(data.projeto);
      setMessage('Votação finalizada com sucesso!');
      await carregarVotos();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao finalizar votação:', err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const votar = async (tipoVoto: 'sim' | 'nao' | 'abster') => {
    if (!isVereador || !isEmVotacao) return;
    
    // Verificar se o vereador está presente antes de permitir o voto
    if (!vereadorPresente) {
      toast.error('Você não pode votar pois está marcado como ausente nesta sessão.');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const res = await fetch(`/api/projetos/${projetoId}/votar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipo_voto: tipoVoto }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar voto');
      }
      
      setMeuVoto(tipoVoto);
      setMessage('Voto registrado com sucesso!');
      await carregarVotos();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao votar:', err);
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const obterStatusBadge = () => {
    if (!projeto) return null;
    
    switch (projeto.status) {
      case 'APRESENTADO':
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs">Apresentado</span>;
      case 'EM_VOTACAO':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">Em Votação</span>;
      case 'APROVADO':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">Aprovado</span>;
      case 'REJEITADO':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">Rejeitado</span>;
      default:
        return <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs">{projeto.status}</span>;
    }
  };
  
  // Função para verificar se o vereador está presente na sessão
  const verificarPresencaVereador = async (sessaoId: number, vereadorId: number) => {
    try {
      setVerificandoPresenca(true);
      
      const response = await fetch(`/api/sessoes/${sessaoId}/vereadores/${vereadorId}/presenca`);
      if (!response.ok) {
        throw new Error('Erro ao verificar presença');
      }
      
      const data = await response.json();
      setVereadorPresente(data.presente);
      
      if (!data.presente) {
        toast.error('Você está marcado como ausente nesta sessão. Só poderá votar quando estiver presente.');
      }
    } catch (err) {
      console.error('Erro ao verificar presença:', err);
      setVereadorPresente(false);
    } finally {
      setVerificandoPresenca(false);
    }
  };
  
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!projeto) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          Projeto não encontrado
        </div>
        <div className="mt-4">
          <Link href={`/camara/${camaraId}/projetos`}>
            <Button variant="outline">Voltar para projetos</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Votação de Projeto</h1>
        <div className="flex gap-2">
          <a 
            href={`/camara/${camaraId}/projetos/${projetoId}/votacao/publica`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white border-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Abrir Painel Público
            </Button>
          </a>
          <Link href={`/camara/${camaraId}/projetos/${projetoId}`}>
            <Button variant="outline" className="cursor-pointer">Voltar ao projeto</Button>
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {message}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{projeto.titulo}</h2>
            {obterStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2 whitespace-pre-wrap text-gray-900 font-medium">{projeto.descricao}</p>
          <div className="text-sm text-gray-900 mt-4 font-medium">
            <p><span className="font-semibold">Autor:</span> {projeto.autor}</p>
            <p><span className="font-semibold">Data de apresentação:</span> {projeto.data_apresentacao}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Controles de votação (admin) */}
      {isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Controles de Votação</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {!isEmVotacao && !isFinalizado && (
                <Button 
                  onClick={iniciarVotacao} 
                  disabled={submitLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <span className="text-xs">▶</span> Iniciar Votação
                </Button>
              )}
              
              {isEmVotacao && (
                <Button 
                  onClick={finalizarVotacao} 
                  disabled={submitLoading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <span className="text-xs">■</span> Finalizar Votação
                </Button>
              )}
            </div>
            
            {isEmVotacao && <p className="mt-4 text-sm text-amber-800 font-medium">Esta votação está em andamento. Os vereadores podem votar agora.</p>}
            {!isEmVotacao && !isFinalizado && <p className="mt-4 text-sm text-gray-700 font-medium">Inicie a votação para permitir que os vereadores votem neste projeto.</p>}
            {isFinalizado && <p className="mt-4 text-sm text-blue-800 font-medium">Esta votação já foi finalizada e não pode ser reaberta.</p>}
          </CardContent>
        </Card>
      )}
      
      {/* Votação (vereador) */}
      {isVereador && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-bold text-gray-900">Seu Voto</h2>
          </CardHeader>
          <CardContent>
            {verificandoPresenca ? (
              <p className="text-gray-700 font-medium">Verificando presença na sessão...</p>
            ) : isEmVotacao && !meuVoto ? (
              vereadorPresente ? (
                <div className="flex flex-wrap gap-4">
                  <Button 
                    onClick={() => votar('sim')} 
                    disabled={submitLoading}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <span className="text-xs">👍</span> Sim
                  </Button>
                  <Button 
                    onClick={() => votar('nao')} 
                    disabled={submitLoading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <span className="text-xs">👎</span> Não
                  </Button>
                  <Button 
                    onClick={() => votar('abster')} 
                    disabled={submitLoading}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xs">⊘</span> Abster-se
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4">
                  <p className="font-medium">Você não pode votar pois está marcado como ausente nesta sessão.</p>
                  <p className="text-sm mt-1">Entre em contato com o presidente da sessão para registrar sua presença.</p>
                </div>
              )
            ) : meuVoto ? (
              <div>
                <p className="text-green-700 font-medium">
                  Seu voto: {meuVoto === 'sim' ? 'Sim' : meuVoto === 'nao' ? 'Não' : 'Abstenção'}
                </p>
              </div>
            ) : (
              <p className="text-gray-700 font-medium">
                Este projeto {isFinalizado ? 'já foi votado' : 'ainda não está em votação'}.
              </p>
            )}
            
            {isEmVotacao && !meuVoto && projeto.sessao_id && (
              <div className="mt-4 text-sm text-gray-700">
                {vereadorPresente ? (
                  <p className="text-green-700 font-medium flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Você está marcado como presente na sessão
                  </p>
                ) : (
                  <p className="text-red-700 font-medium flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Você está marcado como ausente na sessão
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Resultados da votação */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Resultados da Votação</h2>
            {isEmVotacao && <span className="text-xs text-gray-700 font-medium">Atualização em {tempoAteSincronizacao}s</span>}
          </div>
        </CardHeader>
        <CardContent>
          {contagem ? (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded-lg text-center border border-green-300">
                  <div className="text-green-800 text-2xl font-bold">{contagem.sim}</div>
                  <div className="text-green-800 font-medium">Sim</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center border border-red-300">
                  <div className="text-red-800 text-2xl font-bold">{contagem.nao}</div>
                  <div className="text-red-800 font-medium">Não</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-300">
                  <div className="text-gray-800 text-2xl font-bold">{contagem.abster}</div>
                  <div className="text-gray-800 font-medium">Abstenções</div>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Detalhes dos Votos</h3>
              {votos.length > 0 ? (
                <div className="overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Vereador
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Partido
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Voto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {votos.map((voto) => (
                        <tr key={voto.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {voto.vereador?.name || `Vereador ID: ${voto.vereador_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {voto.vereador?.partido || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {voto.tipo_voto === 'sim' ? (
                              <span className="text-green-700 font-medium">Sim</span>
                            ) : voto.tipo_voto === 'nao' ? (
                              <span className="text-red-700 font-medium">Não</span>
                            ) : (
                              <span className="text-gray-700 font-medium">Abstenção</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {voto.created_at}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-700 font-medium">Nenhum voto registrado ainda.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-700 font-medium">Carregando resultados...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 