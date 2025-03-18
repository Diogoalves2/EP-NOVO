'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/config/api';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = Cookies.get('token');
      
      // Chama a API para fazer logout
      await fetch(api.auth.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Remove o cookie
      Cookies.remove('token');
      
      // Redireciona para a página de login
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Remove o cookie mesmo se houver erro na API
      Cookies.remove('token');
      router.push('/login');
    }
  };

  return (
    <div className="h-16 bg-[#2563eb] px-6 py-3 flex items-center justify-between shadow-sm border-b border-white/10">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
        <h2 className="text-lg font-semibold text-white font-rubik">Bem-vindo ao E-Plenarius</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogout}
          className="flex items-center text-lg font-bold text-white hover:text-white hover:bg-[#14213D] px-4 py-2 rounded-lg transition-all duration-200 ease-in-out cursor-pointer font-lato"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>
    </div>
  );
} 