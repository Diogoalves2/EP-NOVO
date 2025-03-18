'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import { getUser } from '@/config/auth';
import { toast } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      const user = getUser();
      
      // Se não estiver logado, redirecionar para o login
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Verificar permissão: apenas super_admin pode acessar a dashboard principal
      if (user.role !== 'super_admin') {
        toast.error('Você não tem permissão para acessar esta página');
        
        // Se for admin ou vereador, redirecionar para a dashboard da câmara
        if (user.camara_id) {
          router.push(`/camara/${user.camara_id}`);
        } else {
          router.push('/login');
        }
        return;
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 