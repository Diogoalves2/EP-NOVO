'use client';

import { useEffect, useState } from 'react';
import { api } from '@/config/api';
import { getToken, getUser } from '@/config/auth';
import { toast } from 'react-hot-toast';
import React from 'react';

interface CamaraStats {
  vereadores_ativos: number;
  sessoes_realizadas: number;
  projetos_em_tramitacao: number;
}

interface CamaraPageProps {
  params: {
    id: string;
  };
}

export default function CamaraDashboardPage({ params }: CamaraPageProps) {
  // Acessando params.id diretamente com supressão de aviso
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const camaraId = params.id;
  
  const [stats, setStats] = useState<CamaraStats>({
    vereadores_ativos: 0,
    sessoes_realizadas: 0,
    projetos_em_tramitacao: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [camaraName, setCamaraName] = useState<string>('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      
      if (!camaraId || !token) {
        setError('Informações da câmara não encontradas');
        setLoading(false);
        return;
      }
      
      // Buscar detalhes da câmara
      const camaraResponse = await fetch(`${api.camaras.get(camaraId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (camaraResponse.ok) {
        const camaraData = await camaraResponse.json();
        setCamaraName(camaraData.nome);
      }
      
      // Buscar estatísticas da câmara
      const statsResponse = await fetch(`${api.camaras.stats(camaraId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!statsResponse.ok) {
        const errorText = await statsResponse.text();
        console.error(`Erro ao carregar estatísticas [${statsResponse.status}]:`, errorText);
        throw new Error(`Falha ao carregar estatísticas: ${statsResponse.status}`);
      }

      const data = await statsResponse.json();
      console.log('Estatísticas carregadas:', data);
      setStats(data);
    } catch (err: any) {
      setError('Erro ao carregar estatísticas do dashboard');
      console.error('Erro completo:', err);
      toast.error(err.message || 'Falha ao carregar dados da câmara');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [camaraId]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-rubik">Dashboard</h1>
        <p className="text-gray-500 text-lg font-lato">
          Bem-vindo ao painel administrativo da {camaraName}. Utilize o menu lateral para navegar entre as funcionalidades.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Vereadores Ativos</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.vereadores_ativos}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Vereadores em exercício</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Sessões Realizadas</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.sessoes_realizadas}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Sessões concluídas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Projetos em Tramitação</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.projetos_em_tramitacao}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Projetos em análise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 