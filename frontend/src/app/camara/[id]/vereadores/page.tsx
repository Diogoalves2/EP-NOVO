"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

interface Vereador {
  id: number;
  name: string;
  email: string;
  cargo: string;
  partido: string;
  foto?: string | null;
}

interface VereadoresPageProps {
  params: {
    id: string;
  };
}

export default function VereadoresPage({ params }: VereadoresPageProps) {
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vereadorSelecionado, setVereadorSelecionado] = useState<Vereador | null>(null);
  
  // Use acesso direto a params.id com supressão de aviso
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const camaraId = params.id;

  useEffect(() => {
    const fetchVereadores = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch(`${api.users.listByCamara(camaraId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar vereadores');
        }

        const data = await response.json();
        setVereadores(data);
      } catch (err) {
        setError('Erro ao carregar lista de vereadores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVereadores();
  }, [camaraId]);

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/uploads/${path}`;
  };

  const abrirDetalhesVereador = (vereador: Vereador) => {
    setVereadorSelecionado(vereador);
  };

  const fecharDetalhesVereador = () => {
    setVereadorSelecionado(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-rubik">Vereadores</h1>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            Total: {vereadores.length} vereadores
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vereadores.map((vereador) => (
            <div
              key={vereador.id}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors duration-200"
              onClick={() => abrirDetalhesVereador(vereador)}
            >
              <div className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {vereador.foto ? (
                      <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                        <img
                          src={getFullUrl(vereador.foto)}
                          alt={`Foto de ${vereador.name}`}
                          className="w-full h-full object-cover"
                          width={64}
                          height={64}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 font-rubik mb-1">
                      {vereador.name}
                    </h2>
                    <div className="flex items-center mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                        {vereador.cargo}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                        {vereador.partido}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate hover:text-blue-600 transition-colors">
                      {vereador.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalhes do vereador */}
      {vereadorSelecionado && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl animate-scaleIn">
            <button 
              onClick={fecharDetalhesVereador}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center mb-6">
              {vereadorSelecionado.foto ? (
                <div className="w-32 h-32 rounded-full bg-gray-50 border border-gray-100 overflow-hidden mb-4 shadow-md">
                  <img
                    src={getFullUrl(vereadorSelecionado.foto)}
                    alt={`Foto de ${vereadorSelecionado.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">{vereadorSelecionado.name}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-800">
                  {vereadorSelecionado.cargo}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {vereadorSelecionado.partido}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Informações de Contato</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-700">{vereadorSelecionado.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={fecharDetalhesVereador}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 