'use client';

import { useEffect, useState } from 'react';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

interface DashboardStats {
  camaras_ativas: number;
  votacoes_em_andamento: number;
  votacoes_finalizadas: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    camaras_ativas: 0,
    votacoes_em_andamento: 0,
    votacoes_finalizadas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch(api.dashboard.stats, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar estatísticas');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Erro ao carregar estatísticas do dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-rubik">Dashboard</h1>
        <p className="text-gray-500 text-lg font-lato">
          Bem-vindo ao painel administrativo do E-Plenarius. Utilize o menu lateral para navegar entre as funcionalidades.
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Câmaras Ativas</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.camaras_ativas}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Câmaras em funcionamento</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Votações em Andamento</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.votacoes_em_andamento}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Votações em processo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Votações Finalizadas</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">
                {loading ? '...' : stats.votacoes_finalizadas}
              </p>
              <p className="text-sm text-gray-500 font-lato truncate">Votações concluídas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 