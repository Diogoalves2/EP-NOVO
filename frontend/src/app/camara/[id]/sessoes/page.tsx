'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { api, apiGet } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

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

export default function SessoesPage({ params }: { params: { id: string } }) {
  // Use React.useMemo() para acessar params.id de forma segura
  const camaraId = React.useMemo(() => params.id, [params.id]);
  
  const router = useRouter();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar as sessões
  const fetchSessoes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiGet<Sessao[]>(api.sessoes.listByCamara(camaraId));
      setSessoes(response);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      setError('Erro ao carregar lista de sessões');
      toast.error(error.message || 'Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Carrega as sessões quando a página é montada
  useEffect(() => {
    fetchSessoes();
  }, [camaraId]);

  // Função para ir para a página de criação de nova sessão
  const navegarParaNovaSessao = () => {
    router.push(`/camara/${camaraId}/sessoes/nova`);
  };

  // Componente para mostrar quando não há sessões
  const SemSessoes = () => (
    <div className="text-center py-10 flex flex-col items-center">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        Nenhuma sessão cadastrada.
      </h3>
      <Button 
        onClick={navegarParaNovaSessao}
        className="cursor-pointer flex items-center bg-blue-600 hover:bg-blue-700 text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Adicionar primeira sessão
      </Button>
    </div>
  );

  // Função para renderizar o status da sessão com cores
  const renderStatus = (status: string) => {
    const statusMap = {
      'agendada': 'bg-blue-100 text-blue-800',
      'em_andamento': 'bg-green-100 text-green-800',
      'finalizada': 'bg-gray-100 text-gray-800',
      'cancelada': 'bg-red-100 text-red-800'
    };
    
    const statusLabel = {
      'agendada': 'Agendada',
      'em_andamento': 'Em andamento',
      'finalizada': 'Finalizada',
      'cancelada': 'Cancelada'
    };
    
    const className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800'}`;
    
    return (
      <span className={className}>
        {statusLabel[status as keyof typeof statusLabel] || status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sessões</h1>
        <Button 
          onClick={navegarParaNovaSessao}
          className="cursor-pointer flex items-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Sessão
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Carregando sessões...</p>
        </div>
      ) : error ? (
        <Card className="border rounded-lg">
          <CardContent className="p-4">
            <SemSessoes />
          </CardContent>
        </Card>
      ) : sessoes.length === 0 ? (
        <Card className="border rounded-lg">
          <CardContent className="p-4">
            <SemSessoes />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessoes.map((sessao) => (
            <Card key={sessao.id} className="border rounded-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{sessao.titulo}</h2>
                  {renderStatus(sessao.status)}
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  {formatDate(new Date(sessao.data))} - {TIPOS_SESSAO[sessao.tipo as keyof typeof TIPOS_SESSAO] || sessao.tipo}
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{sessao.descricao}</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/camara/${camaraId}/sessoes/${sessao.id}`)}
                  className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Ver detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 