'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import Cookies from 'js-cookie';

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

export default function ProjetosPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Acessando params.id diretamente com supressão de aviso
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const camaraId = params.id;

  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar projetos da câmara
  const carregarProjetos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usando a URL relativa para acessar o API handler no Next.js
      const url = `/api/projetos?camara_id=${camaraId}`;
      console.log('Carregando projetos da URL:', url);
      
      // Obter token de autenticação
      const token = Cookies.get('token');
      
      const response = await fetch(url, {
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
    } catch (error: any) {
      console.error('Erro ao carregar projetos:', error);
      setError(error.message || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  // Carrega os projetos quando a página é montada
  useEffect(() => {
    carregarProjetos();
  }, [camaraId]);

  // Função para voltar para a página da câmara
  const voltarParaCamara = () => {
    router.push(`/camara/${camaraId}`);
  };

  // Função para ir para a página de criação de projeto
  const novoProjeto = () => {
    router.push(`/camara/${camaraId}/projetos/novo`);
  };

  // Função para renderizar o status do projeto
  const renderStatusProjeto = (status: string) => {
    const className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_PROJETO_COLOR[status as keyof typeof STATUS_PROJETO_COLOR] || 'bg-gray-100 text-gray-800'}`;
    
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
            onClick={voltarParaCamara}
            className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
          <button
            onClick={carregarProjetos}
            className="ml-2 text-blue-600 hover:text-blue-800"
            title="Atualizar projetos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <Button 
          onClick={novoProjeto}
          className="cursor-pointer"
        >
          Novo Projeto
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando projetos...</p>
        </div>
      ) : error ? (
        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar projetos</h3>
              <p className="text-gray-600">{error}</p>
              <Button 
                onClick={carregarProjetos}
                className="mt-4 cursor-pointer"
              >
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : projetos.length === 0 ? (
        <Card className="border rounded-lg">
          <CardContent className="p-6">
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-gray-600 mb-4">Não há projetos cadastrados para esta câmara.</p>
              <Button 
                onClick={novoProjeto}
                className="cursor-pointer"
              >
                Criar Novo Projeto
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projetos.map(projeto => (
            <div key={projeto.id} className="cursor-pointer" onClick={() => router.push(`/camara/${camaraId}/projetos/${projeto.id}`)}>
              <Card className="border rounded-lg hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{projeto.titulo}</h3>
                    {renderStatusProjeto(projeto.status)}
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2 mb-2">{projeto.descricao}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <span>Autor: {projeto.autor}</span>
                      <span className="mx-2">•</span>
                      <span>Apresentado em: {formatDate(new Date(projeto.data_apresentacao))}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/camara/${camaraId}/projetos/${projeto.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 