'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { api, apiGet, apiPut } from '@/lib/api';
import { getToken } from '@/config/auth';
import { toast } from 'react-hot-toast';

// Definindo tipos necessários
interface FormData {
  titulo: string;
  descricao: string;
  data: string;
  tipo: string;
}

// Interface para a sessão, com base no que vi na página de detalhes da sessão
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

export default function EditarSessaoPage({ 
  params 
}: { 
  params: { id: string, sessaoId: string } 
}) {
  // Use React.useMemo() para acessar params de forma segura
  const resolvedParams = React.useMemo(() => ({
    camaraId: params.id,
    sessaoId: params.sessaoId
  }), [params.id, params.sessaoId]);
  
  const { camaraId, sessaoId } = resolvedParams;
  
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    data: '',
    tipo: 'ordinaria'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Carrega os dados da sessão
  useEffect(() => {
    const loadSessao = async () => {
      try {
        setPageLoading(true);
        
        // Obter token
        const token = getToken();
        if (!token) {
          toast.error('Não autenticado');
          router.push('/login');
          return;
        }
        
        // Carregar dados da sessão
        const sessao = await apiGet<Sessao>(api.sessoes.get(sessaoId));
        
        // Formatar a data para o formato esperado pelo input type="datetime-local"
        const dataFormatada = new Date(sessao.data).toISOString().slice(0, 16);
        
        // Preencher o formulário com os dados da sessão
        setFormData({
          titulo: sessao.titulo,
          descricao: sessao.descricao,
          data: dataFormatada,
          tipo: sessao.tipo
        });
      } catch (error: any) {
        console.error('Erro ao carregar sessão:', error);
        toast.error(error.message || 'Erro ao carregar dados da sessão');
      } finally {
        setPageLoading(false);
      }
    };

    loadSessao();
  }, [sessaoId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiPut(api.sessoes.update(sessaoId), {
        ...formData,
        camara_id: Number(camaraId)
      });
      
      if (response) {
        toast.success('Sessão atualizada com sucesso!');
        router.push(`/camara/${camaraId}/sessoes/${sessaoId}`);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar sessão:', error);
      setMessage(error.message || 'Erro ao atualizar sessão');
    } finally {
      setIsLoading(false);
    }
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
          onClick={() => router.push(`/camara/${camaraId}/sessoes/${sessaoId}`)}
          className="mr-4 text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar Sessão</h1>
      </div>

      <Card className="border rounded-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Sessão</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Digite o título da sessão"
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
                placeholder="Digite a descrição da sessão"
                value={formData.descricao}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data e Hora</Label>
              <Input
                id="data"
                name="data"
                type="datetime-local"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Sessão</Label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
              >
                <option value="ordinaria">Sessão Ordinária</option>
                <option value="extraordinaria">Sessão Extraordinária</option>
                <option value="solene">Sessão Solene</option>
                <option value="especial">Sessão Especial</option>
                <option value="instalacao_legislatura">Sessão Solene de Instalação</option>
                <option value="secreta">Sessão Secreta</option>
                <option value="comunitaria">Sessão Comunitária</option>
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
                onClick={() => router.push(`/camara/${camaraId}/sessoes/${sessaoId}`)}
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