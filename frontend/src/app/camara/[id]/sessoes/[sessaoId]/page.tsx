'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUser, isAuthenticated, User } from '@/config/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import Cookies from 'js-cookie';

// Definindo os tipos para sessão
interface Sessao {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada';
  tipo: string;
  camara_id: number;
  created_at: string;
  updated_at: string;
}

// Objeto para traduzir os tipos de sessão
const TIPOS_SESSAO = {
  ordinaria: 'Sessão Ordinária',
  extraordinaria: 'Sessão Extraordinária',
  solene: 'Sessão Solene',
  especial: 'Sessão Especial',
  instalacao_legislatura: 'Sessão Solene de Instalação',
  secreta: 'Sessão Secreta',
  comunitaria: 'Sessão Comunitária'
} as const;

// Tradução de status
const STATUS_LABEL = {
  'agendada': 'Agendada',
  'em_andamento': 'Em andamento',
  'finalizada': 'Finalizada',
  'cancelada': 'Cancelada'
} as const;

// Cores de status
const STATUS_COLOR = {
  'agendada': 'bg-blue-100 text-blue-800',
  'em_andamento': 'bg-green-100 text-green-800',
  'finalizada': 'bg-gray-100 text-gray-800',
  'cancelada': 'bg-red-100 text-red-800'
} as const;

// Adicionar interface para projetos logo após a interface Sessao
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

// Adicionar tradução para status de projeto
const STATUS_PROJETO = {
  'apresentado': 'Em tramitação',
  'em_votacao': 'Em Votação',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado'
} as const;

// Adicionar cores para status de projeto
const STATUS_PROJETO_COLOR = {
  'apresentado': 'bg-yellow-100 text-yellow-800',
  'em_votacao': 'bg-blue-100 text-blue-800',
  'aprovado': 'bg-green-100 text-green-800',
  'rejeitado': 'bg-red-100 text-red-800'
} as const;

interface Vereador {
  id: number;
  name: string;
  email: string;
  partido: string;
  foto?: string;
}

interface Presenca {
  id: number;
  sessao_id: number;
  vereador_id: number;
  presente: boolean;
  hora_registro: string;
  created_at: string;
  updated_at: string;
  vereador?: {
    name: string;
    partido: string;
    foto?: string;
  };
}

export default function DetalheSessaoPage() {
  const params = useParams();
  const router = useRouter();
  const sessaoId = params?.sessaoId as string;
  const camaraId = params?.id as string;
  
  // Estados
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [estatisticas, setEstatisticas] = useState<{total: number, presentes: number, ausentes: number}>({
    total: 0, 
    presentes: 0, 
    ausentes: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoPresenca, setAtualizandoPresenca] = useState<number | null>(null);
  
  // Verificar autenticação e carregar usuário
  useEffect(() => {
    if (!sessaoId || !camaraId) return;
    
    const loadUser = () => {
      try {
        if (!isAuthenticated()) {
          router.push('/login');
          return;
        }
        
        const userData = getUser();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };
    
    loadUser();
  }, [router, sessaoId, camaraId]);
  
  // Carregar dados da sessão, vereadores e presenças
  useEffect(() => {
    if (!sessaoId || !camaraId) return;
    
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Carregar sessão
        const sessaoRes = await fetch(`/api/sessoes/${sessaoId}`);
        if (!sessaoRes.ok) {
          throw new Error('Erro ao carregar dados da sessão');
        }
        
        const sessaoData = await sessaoRes.json();
        setSessao(sessaoData);
        
        // Carregar vereadores da câmara
        const token = Cookies.get('token');
        const vereadoresRes = await fetch(`/api/camaras/${camaraId}/vereadores`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        if (!vereadoresRes.ok) {
          throw new Error('Erro ao carregar vereadores');
        }
        
        const vereadoresData = await vereadoresRes.json();
        setVereadores(vereadoresData);
        
        // Carregar presenças
        await carregarPresencas();
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message || 'Erro ao carregar dados');
        toast.error(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, [sessaoId, camaraId]);
  
  // Função para carregar presenças
  const carregarPresencas = async () => {
    try {
      // Carregar presenças da sessão
      const url = `/api/sessoes/${sessaoId}/presencas`;
      console.log('Carregando presenças:', url);
      
      const presencasRes = await fetch(url, { 
        headers: { 
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Status da resposta:', presencasRes.status);
      
      if (!presencasRes.ok) {
        const errorText = await presencasRes.text();
        console.error(`Erro ao carregar presenças [${presencasRes.status}]:`, errorText);
        throw new Error(`Erro ao carregar presenças: ${presencasRes.status}`);
      }
      
      const presencasData = await presencasRes.json();
      console.log('Presenças carregadas:', presencasData.length);
      setPresencas(presencasData);
      
      // Calcular estatísticas
      const presentes = presencasData.filter((p: Presenca) => p.presente).length;
      const total = presencasData.length;
      
      setEstatisticas({
        total,
        presentes,
        ausentes: total - presentes
      });
    } catch (err: any) {
      console.error('Erro ao carregar presenças:', err);
      toast.error('Erro ao carregar lista de presenças');
    }
  };
  
  // Função para alternar presença de um vereador
  const alternarPresenca = async (vereadorId: number, presente: boolean) => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem gerenciar presenças');
      return;
    }
    
    try {
      setAtualizandoPresenca(vereadorId);
      
      const res = await fetch(`/api/sessoes/${sessaoId}/presencas/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vereadorId,
          presente
        })
      });
      
      if (!res.ok) {
        throw new Error('Erro ao atualizar presença');
      }
      
      toast.success(`Vereador marcado como ${presente ? 'presente' : 'ausente'}`);
      
      // Recarregar presenças
      await carregarPresencas();
    } catch (err: any) {
      console.error('Erro ao atualizar presença:', err);
      toast.error(err.message || 'Erro ao atualizar presença');
    } finally {
      setAtualizandoPresenca(null);
    }
  };
  
  // Função para marcar todos como presentes/ausentes
  const marcarTodos = async (presentes: boolean) => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem gerenciar presenças');
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const endpoint = presentes ? 'todos-presentes' : 'todos-ausentes';
      const res = await fetch(`/api/sessoes/${sessaoId}/presencas/${endpoint}`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        throw new Error(`Erro ao marcar todos como ${presentes ? 'presentes' : 'ausentes'}`);
      }
      
      toast.success(`Todos os vereadores foram marcados como ${presentes ? 'presentes' : 'ausentes'}`);
      
      // Recarregar presenças
      await carregarPresencas();
    } catch (err: any) {
      console.error('Erro ao atualizar presenças:', err);
      toast.error(err.message || 'Erro ao atualizar presenças');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Função para carregar projetos da sessão
  const carregarProjetosDaSessao = async (sessaoId: string) => {
    setCarregandoProjetos(true);
    try {
      // Usando URL relativa como no restante do código
      const url = `/api/projetos?sessao_id=${sessaoId}`;
      console.log('Carregando projetos da URL:', url);
      
      // Adicionar timestamp para evitar cache
      const requestUrl = `${url}&_t=${new Date().getTime()}`;
      
      // Obter token de autenticação
      const token = Cookies.get('token');
      
      const response = await fetch(requestUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar projetos: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Projetos carregados:', data);
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos da sessão');
    } finally {
      setCarregandoProjetos(false);
    }
  };

  // Efeito para carregar projetos quando a sessão for carregada
  useEffect(() => {
    if (sessao?.id) {
      carregarProjetosDaSessao(sessao.id.toString());
    }
  }, [sessao]);

  // Função para iniciar a sessão
  const iniciarSessao = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem iniciar sessões');
      return;
    }
    
    if (!confirm('Deseja realmente iniciar esta sessão?')) {
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const res = await fetch(`/api/sessoes/${sessaoId}/iniciar`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        throw new Error('Erro ao iniciar sessão');
      }
      
      toast.success('Sessão iniciada com sucesso');
      
      // Recarregar dados da sessão
      const sessaoRes = await fetch(`/api/sessoes/${sessaoId}`);
      const sessaoData = await sessaoRes.json();
      setSessao(sessaoData);
    } catch (err: any) {
      console.error('Erro ao iniciar sessão:', err);
      toast.error(err.message || 'Erro ao iniciar sessão');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Função para finalizar a sessão
  const finalizarSessao = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem finalizar sessões');
      return;
    }
    
    if (!confirm('Deseja realmente finalizar esta sessão?')) {
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const res = await fetch(`/api/sessoes/${sessaoId}/finalizar`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        throw new Error('Erro ao finalizar sessão');
      }
      
      toast.success('Sessão finalizada com sucesso');
      
      // Recarregar dados da sessão
      const sessaoRes = await fetch(`/api/sessoes/${sessaoId}`);
      const sessaoData = await sessaoRes.json();
      setSessao(sessaoData);
    } catch (err: any) {
      console.error('Erro ao finalizar sessão:', err);
      toast.error(err.message || 'Erro ao finalizar sessão');
    } finally {
      setLoadingAction(false);
    }
  };
  
  // Função para cancelar a sessão
  const cancelarSessao = async () => {
    if (!user || user.role !== 'admin') {
      toast.error('Apenas administradores podem cancelar sessões');
      return;
    }
    
    if (!confirm('Deseja realmente cancelar esta sessão?')) {
      return;
    }
    
    try {
      setLoadingAction(true);
      
      const res = await fetch(`/api/sessoes/${sessaoId}/cancelar`, {
        method: 'POST'
      });
      
      if (!res.ok) {
        throw new Error('Erro ao cancelar sessão');
      }
      
      toast.success('Sessão cancelada com sucesso');
      
      // Recarregar dados da sessão
      const sessaoRes = await fetch(`/api/sessoes/${sessaoId}`);
      const sessaoData = await sessaoRes.json();
      setSessao(sessaoData);
    } catch (err: any) {
      console.error('Erro ao cancelar sessão:', err);
      toast.error(err.message || 'Erro ao cancelar sessão');
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (error || !sessao) {
    return <div className="container mx-auto p-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error || 'Sessão não encontrada'}
      </div>
      <div className="mt-4">
        <Link href={`/camara/${camaraId}/sessoes`}>
          <Button variant="outline">Voltar para sessões</Button>
        </Link>
      </div>
    </div>;
  }
  
  const isAdmin = user?.role === 'admin';
  const isEmAndamento = sessao.status === 'em_andamento';
  
  // Mesclar vereadores com seus dados de presença
  const vereadoresComPresenca = vereadores.map(vereador => {
    const presenca = presencas.find(p => p.vereador_id === vereador.id);
    return {
      ...vereador,
      presenca: presenca ? presenca.presente : false,
      presencaId: presenca?.id
    };
  });
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Detalhes da Sessão</h1>
        <div className="flex gap-2">
          <Link href={`/camara/${camaraId}/sessoes`}>
            <Button variant="outline" className="cursor-pointer">Voltar para sessões</Button>
          </Link>
        </div>
      </div>
      
      {/* Detalhes da sessão */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{sessao.titulo}</h2>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {sessao.tipo.charAt(0).toUpperCase() + sessao.tipo.slice(1)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-900 whitespace-pre-wrap mb-4">{sessao.descricao}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-gray-900 font-semibold">Data:</p>
              <p className="text-gray-900">{new Date(sessao.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-900 font-semibold">Status:</p>
              <p className="text-gray-900">{sessao.status.charAt(0).toUpperCase() + sessao.status.slice(1)}</p>
            </div>
          </div>
          
          {/* Controles da sessão */}
          {isAdmin && (
            <div className="mt-4 flex gap-2">
              {sessao.status === 'agendada' && (
                <Button
                  onClick={iniciarSessao}
                  disabled={loadingAction}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Iniciar Sessão
                </Button>
              )}
              
              {sessao.status === 'em_andamento' && (
                <Button
                  onClick={finalizarSessao}
                  disabled={loadingAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Finalizar Sessão
                </Button>
              )}
              
              {(sessao.status === 'agendada' || sessao.status === 'em_andamento') && (
                <Button
                  onClick={cancelarSessao}
                  disabled={loadingAction}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancelar Sessão
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Gestão de presenças */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Lista de Presença</h2>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button 
                    onClick={() => marcarTodos(true)} 
                    variant="outline" 
                    disabled={loadingAction}
                    className="text-green-500 border-green-500 hover:bg-green-50"
                  >
                    Marcar todos presentes
                  </Button>
                  <Button 
                    onClick={() => marcarTodos(false)} 
                    variant="outline" 
                    disabled={loadingAction}
                    className="text-red-500 border-red-500 hover:bg-red-50"
                  >
                    Marcar todos ausentes
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <span className="text-green-800 text-2xl font-bold">{estatisticas.presentes}</span>
              <p className="text-green-800">Presentes</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <span className="text-red-800 text-2xl font-bold">{estatisticas.ausentes}</span>
              <p className="text-red-800">Ausentes</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <span className="text-gray-800 text-2xl font-bold">{estatisticas.total}</span>
              <p className="text-gray-800">Total</p>
            </div>
          </div>
          
          {/* Lista de vereadores */}
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Vereador
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Partido
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vereadoresComPresenca.length > 0 ? (
                  vereadoresComPresenca.map((vereador) => (
                    <tr key={vereador.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {vereador.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vereador.partido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {vereador.presenca ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Presente
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Ausente
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => alternarPresenca(vereador.id, !vereador.presenca)}
                            variant="outline"
                            disabled={atualizandoPresenca === vereador.id}
                            className={
                              vereador.presenca 
                                ? "text-red-500 border-red-500 hover:bg-red-50" 
                                : "text-green-500 border-green-500 hover:bg-green-50"
                            }
                          >
                            {atualizandoPresenca === vereador.id 
                              ? 'Atualizando...' 
                              : vereador.presenca 
                                ? 'Marcar ausente' 
                                : 'Marcar presente'
                            }
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum vereador encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Projetos da sessão */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Projetos da Sessão</h2>
            <Button 
              onClick={() => carregarProjetosDaSessao(sessaoId)}
              variant="outline" 
              disabled={carregandoProjetos}
            >
              {carregandoProjetos ? 'Carregando...' : 'Atualizar projetos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {carregandoProjetos ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : projetos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetos.map((projeto) => (
                <Link 
                  key={projeto.id} 
                  href={`/camara/${camaraId}/projetos/${projeto.id}`}
                  className="block"
                >
                  <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <h3 className="font-semibold text-lg text-gray-900">{projeto.titulo}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{projeto.descricao}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">
                        Autor: {projeto.autor}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_PROJETO_COLOR[projeto.status as keyof typeof STATUS_PROJETO_COLOR]}`}>
                        {STATUS_PROJETO[projeto.status as keyof typeof STATUS_PROJETO] || projeto.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum projeto vinculado a esta sessão
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 