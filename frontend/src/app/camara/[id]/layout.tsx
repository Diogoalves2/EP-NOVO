'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logout, getUser, getToken } from '@/config/auth';
import { toast } from 'react-hot-toast';
import { api } from '@/config/api';

export default function CamaraLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [camaraName, setCamaraName] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  // Acessando params.id diretamente com supressão de aviso
  // Esta abordagem é mais segura porque o Next.js ainda suporta acesso direto
  // @ts-ignore - Suprimir aviso sobre acesso direto a params
  const camaraId = params.id;

  useEffect(() => {
    // Carregando o usuário no cliente para evitar problemas de hidratação
    const user = getUser();
    if (user) {
      setUserName(user.name || '');
    }
    
    // Não prosseguir se o ID da câmara não estiver disponível
    if (!camaraId) return;

    setIsLoading(true);
    const token = getToken();
    if (!token) return;

    async function fetchCamaraDetails() {
      try {
        const response = await fetch(`${api.camaras.get(camaraId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Câmara não encontrada');
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const data = await response.json();
        setCamaraName(data.nome || 'Câmara Municipal');
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar detalhes da câmara:', error);
        toast.error('Erro ao carregar dados da câmara');
        setIsLoading(false);
      }
    }

    fetchCamaraDetails();
  }, [camaraId, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-[#14213D] w-64 border-r border-white/10 flex-shrink-0 ${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <h2 className="text-xl font-bold font-rubik text-white">E-Plenarius</h2>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              <Link 
                href={`/camara/${camaraId}`} 
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              
              <Link 
                href={`/camara/${camaraId}/vereadores`} 
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Vereadores
              </Link>
              
              <Link 
                href={`/camara/${camaraId}/sessoes`} 
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sessões
              </Link>
              
              <Link 
                href={`/camara/${camaraId}/projetos`} 
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-[#2563eb] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Projetos
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <header className="bg-[#2563eb] border-b border-white/10 shadow-sm h-16">
            <div className="flex items-center justify-between px-6 py-3 h-full">
              <div className="flex items-center">
                <div className="flex items-center">
                  <button 
                    className="lg:hidden text-white hover:text-gray-200 focus:outline-none" 
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h1 className="text-xl font-semibold text-white ml-3">{camaraName}</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-white">
                  {userName}
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-white hover:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 