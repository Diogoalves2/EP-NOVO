'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { api } from '@/config/api';
import { setToken, setUser } from '@/config/auth';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      console.log('Enviando requisição para:', api.auth.login);
      console.log('Dados do login:', formData);
      
      const response = await fetch(api.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Resposta do servidor:', response.status, data);

      if (!response.ok) {
        toast.error(`Erro ${response.status}: ${data.error || 'Erro ao fazer login'}`);
        setErrors({
          email: `${response.status} - ${data.error || 'Erro ao fazer login'}`
        });
        return;
      }

      if (data.token) {
        setToken(data.token);
      }
      if (data.user) {
        setUser(data.user);
        
        // Redirecionar com base no papel do usuário
        if (data.user.role === 'super_admin') {
          // Super admin vai para a dashboard principal
          router.push('/dashboard');
        } else if (data.user.role === 'admin' || data.user.role === 'vereador') {
          // Presidente (admin) e vereadores vão para a dashboard da câmara deles
          if (data.user.camara_id) {
            router.push(`/camara/${data.user.camara_id}`);
          } else {
            // Caso não tenha câmara vinculada (não deveria acontecer)
            toast.error('Usuário sem câmara vinculada');
          }
        }
      }

      toast.success('Login realizado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Response) {
        const statusCode = error.status;
        const errorData = await error.json();
        console.log(`Resposta do servidor: ${statusCode}`, errorData);
        
        if (statusCode === 401) {
          const errorMessage = errorData.detail || errorData.error || 'Credenciais inválidas';
          setFormError(errorMessage);
          toast.error(errorMessage);
        } else {
          setFormError('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
          toast.error('Erro de servidor ao fazer login. Tente novamente em instantes.');
        }
      } else {
        setFormError('Erro de conexão. Verifique sua internet e tente novamente.');
        toast.error('Erro de conexão ao servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-md border border-[#E5E5E5]">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-[#14213D] font-rubik">
            Bem-vindo ao E-Plenarius
          </h2>
          <p className="mt-2 text-center text-sm text-[#14213D]/60 font-lato">
            Faça login para acessar o sistema
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#14213D] font-lato">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`block w-full px-4 pr-10 py-3 bg-[#F8F9FA] border ${
                    errors.email ? 'border-red-300' : 'border-[#E5E5E5]'
                  } rounded-lg text-[#14213D] text-base font-lato placeholder-[#14213D]/40 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-200`}
                  placeholder="seu@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-lato">{errors.email}</p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#14213D] font-lato">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`block w-full px-4 pr-12 py-3 bg-[#F8F9FA] border ${
                    errors.password ? 'border-red-300' : 'border-[#E5E5E5]'
                  } rounded-lg text-[#14213D] text-base font-lato placeholder-[#14213D]/40 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-lato">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] transition-all duration-200 font-lato text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : "Entrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 