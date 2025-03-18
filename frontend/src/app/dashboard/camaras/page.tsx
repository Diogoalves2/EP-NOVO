'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

const getFullUrl = (path: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/uploads/${path}`;
};

interface Camara {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  created_at: string;
  updated_at: string;
  logo: string | null;
  telefone: string;
  email: string;
}

export default function CamarasPage() {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const refresh = searchParams.get('refresh');

  useEffect(() => {
    const fetchCamaras = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Não autorizado');
        }

        const response = await fetch(api.camaras.list, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Não autorizado');
          }
          throw new Error('Erro ao carregar câmaras');
        }

        const data = await response.json();
        setCamaras(data);
      } catch (error: any) {
        console.error('Erro ao buscar câmaras:', error);
        setError(error.message || 'Erro ao carregar câmaras. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamaras();
  }, [refresh]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#14213D] font-rubik">Câmaras</h1>
          <p className="text-[#14213D]/60 mt-1 font-lato">Gerencie todas as câmaras do sistema</p>
        </div>
        <Link
          href="/dashboard/camaras/nova"
          className="bg-[#2563eb] hover:bg-[#14213D] text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 font-lato inline-flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nova Câmara</span>
        </Link>
      </div>

      {error ? (
        <div className="text-center text-red-600 min-h-[200px] flex items-center justify-center">
          <p>{error}</p>
        </div>
      ) : camaras.length === 0 ? (
        <div className="text-center min-h-[200px] flex flex-col items-center justify-center space-y-4">
          <div className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg font-semibold">Nenhuma câmara cadastrada</p>
            <p className="mt-2">Clique no botão "Nova Câmara" para começar</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {camaras.map((camara) => (
            <div
              key={camara.id}
              className="block bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-200 transition-all duration-200"
            >
              <Link
                href={`/dashboard/camaras/${camara.id}`}
                className="flex items-center space-x-4"
              >
                <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-blue-100 transition-colors">
                  {camara.logo ? (
                    <img
                      src={getFullUrl(camara.logo)}
                      alt={`Logo da ${camara.nome}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{camara.nome}</h3>
                  <div className="flex items-center space-x-4 text-gray-500 mt-1">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm truncate">{camara.cidade} - {camara.estado}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-500 mt-2">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm truncate">{camara.telefone}</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Botão para acessar o dashboard individual */}
              <Link
                href={`/camara/${camara.id}`}
                className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group w-full"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                  />
                </svg>
                <span className="font-medium">Acessar Dashboard</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 