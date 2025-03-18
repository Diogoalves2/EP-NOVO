'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

interface ConfiguracoesSistema {
  nome_sistema: string;
  logo?: string | null;
  tema_primario: string;
  tema_secundario: string;
  email_suporte: string;
  telefone_suporte: string;
}

export default function ConfiguracoesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesSistema>({
    nome_sistema: 'E-Plenarius',
    tema_primario: '#2563eb',
    tema_secundario: '#1d4ed8',
    email_suporte: '',
    telefone_suporte: '',
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Não autorizado');
      }

      const response = await fetch(api.configuracoes.get, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      const data = await response.json();
      setConfiguracoes(data);
      if (data.logo) {
        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${data.logo}`);
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Não autorizado');
      }

      const formData = new FormData();
      Object.entries(configuracoes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      const response = await fetch(api.configuracoes.update, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações do sistema');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 font-rubik mb-6">Configurações do Sistema</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo do Sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo do Sistema
            </label>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo do sistema"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Alterar Logo
                </label>
              </div>
            </div>
          </div>

          {/* Nome do Sistema */}
          <div>
            <label htmlFor="nome_sistema" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Sistema
            </label>
            <input
              type="text"
              id="nome_sistema"
              value={configuracoes.nome_sistema}
              onChange={(e) => setConfiguracoes({ ...configuracoes, nome_sistema: e.target.value })}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Cores do Tema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tema_primario" className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="tema_primario"
                  value={configuracoes.tema_primario}
                  onChange={(e) => setConfiguracoes({ ...configuracoes, tema_primario: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={configuracoes.tema_primario}
                  onChange={(e) => setConfiguracoes({ ...configuracoes, tema_primario: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="tema_secundario" className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  id="tema_secundario"
                  value={configuracoes.tema_secundario}
                  onChange={(e) => setConfiguracoes({ ...configuracoes, tema_secundario: e.target.value })}
                  className="h-10 w-20 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={configuracoes.tema_secundario}
                  onChange={(e) => setConfiguracoes({ ...configuracoes, tema_secundario: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Informações de Suporte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email_suporte" className="block text-sm font-medium text-gray-700 mb-2">
                Email de Suporte
              </label>
              <input
                type="email"
                id="email_suporte"
                value={configuracoes.email_suporte}
                onChange={(e) => setConfiguracoes({ ...configuracoes, email_suporte: e.target.value })}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="telefone_suporte" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Suporte
              </label>
              <input
                type="tel"
                id="telefone_suporte"
                value={configuracoes.telefone_suporte}
                onChange={(e) => setConfiguracoes({ ...configuracoes, telefone_suporte: e.target.value })}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-lg transition-colors ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 