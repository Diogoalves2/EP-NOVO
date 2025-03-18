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
interface Vereador {
  id: number;
  nome: string;
}

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
  sessao_id: string;
  status: string;
}

export default function NovoProjeto({ params }: { params: { id: string } }) {
  // Use React.useMemo() para acessar params.id de forma segura
  const camaraId = React.useMemo(() => params.id, [params.id]);
  
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    autor: '',
    sessao_id: '',
    status: 'apresentado'
  });
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Carrega os vereadores e sessões disponíveis
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();
        if (!token) {
          toast.error('Não autenticado');
          router.push('/login');
          return;
        }
        
        // Verificar se há um parâmetro de sessão na URL
        const urlParams = new URLSearchParams(window.location.search);
        const sessaoParam = urlParams.get('sessao');
        
        if (sessaoParam) {
          // Pré-selecionar a sessão
          setFormData(prev => ({
            ...prev,
            sessao_id: sessaoParam
          }));
        }
        
        // Carrega os vereadores da câmara
        const response = await fetch(`${api.users.list}?camara_id=${camaraId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Falha ao carregar vereadores');
        }
        
        const vereadorData = await response.json();
        setVereadores(vereadorData);

        // Carrega as sessões da câmara (apenas agendadas ou em andamento)
        const sessaoResponse = await fetch(`${api.sessoes.listByCamara(camaraId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!sessaoResponse.ok) {
          throw new Error('Falha ao carregar sessões');
        }
        
        const sessoesData = await sessaoResponse.json();
        const sessoesAtivas = sessoesData.filter(
          (sessao: Sessao) => sessao.status === 'agendada' || sessao.status === 'em_andamento'
        );
        setSessoes(sessoesAtivas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [camaraId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      console.log('Iniciando envio do formulário');
      
      // Verificar token no localStorage
      const token = localStorage.getItem('token');
      console.log('Token obtido:', token ? 'Presente' : 'Ausente');

      if (!token) {
        setMessage('Você precisa estar logado para criar um projeto');
        setIsLoading(false);
        return;
      }

      // Preparar dados para envio
      const projetoData = {
        titulo: formData.titulo,
        autor: formData.autor,
        descricao: formData.descricao,
        sessao_id: Number(formData.sessao_id),
        camara_id: Number(camaraId),
        status: formData.status
      };

      console.log('Dados a serem enviados:', projetoData);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos`;
      console.log('URL da API:', apiUrl);
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projetoData)
      };
      
      console.log('Método:', requestOptions.method);
      console.log('Cabeçalhos:', requestOptions.headers);
      console.log('Body:', requestOptions.body);
      
      // Fazer a requisição sem autenticação para teste
      const updatedRequestOptions = {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await fetch(apiUrl, updatedRequestOptions);
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Erro da API:', errorData);
        throw new Error(`Falha ao criar projeto: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      toast.success('Projeto criado com sucesso!');
      
      // Redirecionar para a página da sessão ao invés da lista de projetos
      if (formData.sessao_id) {
        router.push(`/camara/${camaraId}/sessoes/${formData.sessao_id}`);
      } else {
        router.push(`/camara/${camaraId}/projetos`);
      }
    } catch (error) {
      console.error('Erro na requisição fetch:', error);
      setMessage('Erro ao criar projeto. Por favor, tente novamente.');
      console.error('Erro ao criar projeto:', error);
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
          onClick={() => router.push(`/camara/${camaraId}/projetos`)}
          className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Novo Projeto</h1>
      </div>

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          {sessoes.length === 0 ? (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma sessão disponível</h3>
              <p className="text-gray-600 mb-4">Para cadastrar um projeto, é necessário ter uma sessão agendada ou em andamento.</p>
              <Button 
                onClick={() => router.push(`/camara/${camaraId}/sessoes/nova`)}
                className="cursor-pointer"
              >
                Criar Nova Sessão
              </Button>
            </div>
          ) : (
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
                <p className="text-sm text-gray-700 mt-1">
                  Apenas sessões agendadas ou em andamento estão disponíveis.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/camara/${camaraId}/projetos`)}
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
                    'Salvar Projeto'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 