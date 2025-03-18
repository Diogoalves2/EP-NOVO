'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

// Definindo os tipos para projeto
interface Projeto {
  id: number;
  titulo: string;
  descricao: string;
  autor: string;
  status: string;
  data_apresentacao: string;
  sessao_id: number;
  camara_id: number;
  sessao?: {
    id: number;
    titulo: string;
    data: string;
  };
  created_at: string;
  updated_at: string;
}

// Tradução para status de projeto
const STATUS_PROJETO = {
  'apresentado': 'Em tramitação',
  'em_votacao': 'Em Votação',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado'
} as const;

// Cores para status de projeto
const STATUS_PROJETO_COLOR = {
  'apresentado': 'bg-yellow-100 text-yellow-800',
  'em_votacao': 'bg-blue-100 text-blue-800',
  'aprovado': 'bg-green-100 text-green-800',
  'rejeitado': 'bg-red-100 text-red-800'
} as const;

export default function DetalhesProjetoPage({ 
  params 
}: { 
  params: { id: string, projetoId: string } 
}) {
  // Acessando params.id e params.projetoId diretamente com supressão de aviso
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const camaraId = params.id;
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const projetoId = params.projetoId;
  
  const router = useRouter();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar o projeto
  const fetchProjeto = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}`;
      console.log('Carregando projeto da URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar projeto: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Projeto carregado:', data);
      setProjeto(data);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do projeto:', error);
      setError('Erro ao carregar detalhes do projeto');
      toast.error(error.message || 'Erro ao carregar detalhes do projeto');
    } finally {
      setLoading(false);
    }
  };

  // Carrega o projeto quando a página é montada
  useEffect(() => {
    if (projetoId) {
      fetchProjeto();
    }
  }, [projetoId]);

  // Função para voltar para a lista de projetos
  const voltarParaProjetos = () => {
    router.push(`/camara/${camaraId}/projetos`);
  };

  // Função para voltar para a sessão
  const voltarParaSessao = () => {
    if (projeto && projeto.sessao_id) {
      router.push(`/camara/${camaraId}/sessoes/${projeto.sessao_id}`);
    }
  };

  // Função para editar o projeto
  const editarProjeto = () => {
    router.push(`/camara/${camaraId}/projetos/${projetoId}/editar`);
  };

  // Função para deletar o projeto
  const deletarProjeto = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) {
      return;
    }
    
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao excluir projeto: ${response.status}`);
      }
      
      toast.success('Projeto excluído com sucesso!');
      router.push(`/camara/${camaraId}/projetos`);
    } catch (error: any) {
      console.error('Erro ao excluir projeto:', error);
      toast.error(error.message || 'Erro ao excluir projeto');
    }
  };

  // Função para renderizar o status do projeto
  const renderStatusProjeto = (status: string) => {
    const className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${STATUS_PROJETO_COLOR[status as keyof typeof STATUS_PROJETO_COLOR] || 'bg-gray-100 text-gray-800'}`;
    
    return (
      <span className={className}>
        {STATUS_PROJETO[status as keyof typeof STATUS_PROJETO] || status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={voltarParaProjetos}
            className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Projeto</h1>
        </div>
        
        {projeto && (
          <div className="flex space-x-3">
            <Button 
              onClick={editarProjeto}
              className="cursor-pointer flex items-center px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </Button>
            <Button 
              onClick={() => router.push(`/camara/${camaraId}/projetos/${projetoId}/votacao`)}
              className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white flex items-center px-4 py-2 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Votação</span>
            </Button>
            
            {projeto && projeto.status === 'em_votacao' && (
              <a 
                href={`/camara/${camaraId}/projetos/${projetoId}/votacao/publica`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Button 
                  className="flex items-center px-4 py-2 text-sm font-medium cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Painel Público</span>
                </Button>
              </a>
            )}
            <Button 
              onClick={deletarProjeto}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white flex items-center px-4 py-2 text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Excluir</span>
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando detalhes do projeto...</p>
        </div>
      ) : error ? (
        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar detalhes</h3>
              <p className="text-gray-600">{error}</p>
              <Button 
                onClick={voltarParaProjetos}
                className="mt-4 cursor-pointer"
              >
                Voltar para projetos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : projeto ? (
        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{projeto.titulo}</h2>
                <div className="flex items-center mb-4">
                  <span className="text-gray-600 mr-4">
                    Apresentado em: {formatDate(new Date(projeto.data_apresentacao))}
                  </span>
                  {renderStatusProjeto(projeto.status)}
                </div>
                <div className="mb-4">
                  <span className="font-medium text-gray-700">Autor:</span>{' '}
                  <span className="text-gray-900">{projeto.autor}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-line">{projeto.descricao}</p>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações da Sessão</h3>
              <div className="flex flex-col space-y-2">
                <button 
                  onClick={voltarParaSessao}
                  className="text-blue-600 hover:text-blue-800 text-left"
                >
                  Visualizar sessão vinculada (ID: {projeto.sessao_id})
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="text-sm text-gray-500">
                <div>Criado em: {formatDate(new Date(projeto.created_at))}</div>
                <div>Última atualização: {formatDate(new Date(projeto.updated_at))}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="text-center py-6">
              <p className="text-gray-600">Projeto não encontrado.</p>
              <Button 
                onClick={voltarParaProjetos}
                className="mt-4 cursor-pointer"
              >
                Voltar para projetos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 