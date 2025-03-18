'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { api } from '@/lib/api';
import { getToken } from '@/config/auth';
import { toast } from 'react-hot-toast';

// Definindo tipos necessários
interface Sessao {
  id: number;
  titulo: string;
  data: string;
  status: string;
}

interface FormData {
  titulo: string;
  descricao: string;
  autor: string;
  status: string;
  sessao_id: string;
}

export default function EditarProjetoPage({ 
  params 
}: { 
  params: { id: string, projetoId: string } 
}) {
  // Usando React.useMemo para acessar params.id e params.projetoId de forma segura
  const camaraId = React.useMemo(() => params.id, [params]);
  const projetoId = React.useMemo(() => params.projetoId, [params]);
  
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    autor: '',
    status: 'apresentado',
    sessao_id: ''
  });
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Carrega os dados do projeto e as sessões disponíveis
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        
        // Carregar dados do projeto
        const projetoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}`;
        const projetoResponse = await fetch(projetoUrl, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!projetoResponse.ok) {
          throw new Error(`Erro ao carregar projeto: ${projetoResponse.status}`);
        }
        
        const projetoData = await projetoResponse.json();
        
        // Preencher o formulário com os dados do projeto
        setFormData({
          titulo: projetoData.titulo,
          descricao: projetoData.descricao,
          autor: projetoData.autor,
          status: projetoData.status,
          sessao_id: projetoData.sessao_id.toString()
        });
        
        // Carregar sessões da câmara
        const token = getToken();
        if (!token) {
          toast.error('Não autenticado');
          router.push('/login');
          return;
        }
        
        const sessoesUrl = `${api.sessoes.listByCamara(camaraId)}`;
        const sessoesResponse = await fetch(sessoesUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!sessoesResponse.ok) {
          throw new Error('Falha ao carregar sessões');
        }
        
        const sessoesData = await sessoesResponse.json();
        setSessoes(sessoesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados do projeto');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [camaraId, projetoId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Iniciando atualização do projeto');
      
      // Verificar token no localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Você precisa estar logado para atualizar um projeto');
        setIsLoading(false);
        return;
      }

      // Preparar dados para envio
      const projetoData = {
        titulo: formData.titulo,
        autor: formData.autor,
        descricao: formData.descricao,
        status: formData.status,
        sessao_id: Number(formData.sessao_id)
      };

      console.log('Dados a serem enviados:', projetoData);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projetoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Erro da API:', errorData);
        throw new Error(`Falha ao atualizar projeto: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      toast.success('Projeto atualizado com sucesso!');
      
      // Redirecionar para a página de detalhes do projeto
      router.push(`/camara/${camaraId}/projetos/${projetoId}`);
    } catch (error) {
      console.error('Erro na requisição fetch:', error);
      setMessage('Erro ao atualizar projeto. Por favor, tente novamente.');
      console.error('Erro ao atualizar projeto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para formatar a data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => router.push(`/camara/${camaraId}/projetos/${projetoId}`)}
          className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar Projeto</h1>
      </div>

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Projeto</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Digite o título do projeto"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Digite a descrição detalhada do projeto"
                value={formData.descricao}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autor">Nome do Autor</Label>
              <Input
                id="autor"
                name="autor"
                placeholder="Digite o nome do autor do projeto"
                value={formData.autor}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status do Projeto</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
              >
                <option value="apresentado">Em tramitação</option>
                <option value="em_votacao">Em Votação</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessao_id">Vincular à Sessão</Label>
              <select
                id="sessao_id"
                name="sessao_id"
                value={formData.sessao_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
              >
                <option value="">Selecione a sessão</option>
                {sessoes.map(sessao => (
                  <option key={sessao.id} value={sessao.id}>
                    {sessao.titulo} - {formatarData(sessao.data)}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{message}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/camara/${camaraId}/projetos/${projetoId}`)}
                className="cursor-pointer"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 