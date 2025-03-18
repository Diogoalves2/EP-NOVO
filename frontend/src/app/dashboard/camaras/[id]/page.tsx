'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { API_URL } from '@/config/api';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

interface Vereador {
  id: number;
  name: string;
  email: string;
  cargo: string;
  partido: string;
  foto?: string | null;
  created_at: string;
  updated_at: string;
}

interface Camara {
  id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  site: string | null;
  logo: string;
  regimento_interno: string;
  created_at: string;
  updated_at: string;
}

function CamaraContent({ id }: { id: string }) {
  const [camara, setCamara] = useState<Camara | null>(null);
  const [vereadores, setVereadores] = useState<Vereador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCamara = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Não autorizado');
        }

        const response = await fetch(api.camaras.get(id), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar dados da câmara');
        }

        const data = await response.json();
        setCamara(data);

        // Buscar vereadores
        const vereadoresResponse = await fetch(`${api.users.list}?camara_id=${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!vereadoresResponse.ok) {
          throw new Error('Erro ao carregar vereadores');
        }

        const vereadoresData = await vereadoresResponse.json();
        setVereadores(vereadoresData);
      } catch (error: any) {
        console.error('Erro ao buscar câmara:', error);
        setError(error.message || 'Erro ao carregar dados da câmara. Por favor, tente novamente.');
        toast.error(error.message || 'Erro ao carregar dados da câmara');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCamara();
  }, [id]);

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${path}`;
  };

  const imageLoader = ({ src, width }: { src: string, width: number }) => {
    try {
      // Verifica se a URL é válida
      const url = new URL(src);
      return url.toString();
    } catch (e) {
      console.error('URL inválida:', src);
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !camara) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 text-lg font-medium">{error || 'Câmara não encontrada'}</p>
        <Link 
          href="/dashboard/camaras"
          className="text-[#2563eb] hover:text-[#1d4ed8] transition-colors font-medium"
        >
          Voltar para lista de câmaras
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Botões de Navegação */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/camaras"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </Link>

        <div className="flex items-center space-x-4">
          {camara.regimento_interno && (
            <a 
              href={getFullUrl(camara.regimento_interno)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Regimento Interno
            </a>
          )}
          <Link
            href={`/dashboard/camaras/${id}/editar`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Câmara
          </Link>
        </div>
      </div>

      {/* Header com Informações da Câmara */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-6">
          {camara.logo && (
            <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={getFullUrl(camara.logo)}
                alt={`Logo da ${camara.nome}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 font-rubik mb-2">{camara.nome}</h1>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{camara.cidade} - {camara.estado}</span>
              </div>
              {camara.site && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={camara.site} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    {new URL(camara.site).hostname}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Total de Membros</h3>
              <p className="text-2xl font-semibold text-gray-900 font-rubik mt-1">{vereadores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Contato</h3>
              <p className="text-lg font-semibold text-gray-900 font-rubik mt-1 truncate">{camara.telefone}</p>
              <p className="text-sm text-gray-500 font-lato truncate">{camara.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 hover:border-blue-100 transition-all duration-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-500 font-lato truncate">Endereço</h3>
              <p className="text-lg font-semibold text-gray-900 font-rubik mt-1 truncate">{camara.endereco}</p>
              <p className="text-sm text-gray-500 font-lato truncate">CEP: {camara.cep}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vereadores Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Vereadores</h2>
          <Link
            href={`/dashboard/camaras/${id}/vereadores/novo`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Vereador
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vereadores.map((vereador) => (
            <Link
              key={vereador.id}
              href={`/dashboard/camaras/${id}/vereadores/${vereador.id}`}
              className="group block bg-white rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/5 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 group-hover:border-blue-100 transition-colors">
                  {vereador.foto ? (
                    <img
                      src={getFullUrl(vereador.foto)}
                      alt={`Foto de ${vereador.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{vereador.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-1">{vereador.cargo}</p>
                  <p className="text-sm text-gray-500">{vereador.partido}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CamaraPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <CamaraContent id={resolvedParams.id} />;
}