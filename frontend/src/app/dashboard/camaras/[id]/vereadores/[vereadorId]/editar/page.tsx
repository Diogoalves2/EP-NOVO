'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

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

function EditarVereadorContent({ camaraId, vereadorId }: { camaraId: string; vereadorId: string }) {
  const [vereador, setVereador] = useState<Vereador | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cargo: '',
    partido: '',
    senha: '',
    confirmarSenha: '',
    foto: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const fetchVereador = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Não autorizado');
        }

        const response = await fetch(api.users.get(vereadorId), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar dados do vereador');
        }

        const data = await response.json();
        setVereador(data);
        setFormData({
          name: data.name,
          email: data.email,
          cargo: data.cargo,
          partido: data.partido,
          senha: '',
          confirmarSenha: '',
          foto: null
        });
        if (data.foto) {
          setPreviewUrl(getFullUrl(data.foto));
        }
      } catch (error: any) {
        console.error('Erro ao buscar vereador:', error);
        setError(error.message || 'Erro ao carregar dados do vereador');
        toast.error(error.message || 'Erro ao carregar dados do vereador');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVereador();
  }, [vereadorId]);

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${path}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      setPreviewUrl(URL.createObjectURL(file));
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

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('cargo', formData.cargo);
      formDataToSend.append('partido', formData.partido);
      formDataToSend.append('camara_id', camaraId);
      
      if (formData.senha) {
        if (formData.senha !== formData.confirmarSenha) {
          throw new Error('As senhas não conferem');
        }
        formDataToSend.append('senha', formData.senha);
      }
      
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }

      console.log('Enviando dados:', Object.fromEntries(formDataToSend.entries()));
      console.log('Arquivo:', formData.foto);

      const response = await fetch(api.users.update(vereadorId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar vereador');
      }

      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);

      toast.success('Vereador atualizado com sucesso!');
      window.location.href = `/dashboard/camaras/${camaraId}/vereadores/${vereadorId}`;
    } catch (error: any) {
      console.error('Erro ao atualizar vereador:', error);
      toast.error(error.message || 'Erro ao atualizar vereador');
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

  if (error || !vereador) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 text-lg font-medium">{error || 'Vereador não encontrado'}</p>
        <Link 
          href={`/dashboard/camaras/${camaraId}`}
          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Voltar para detalhes da câmara
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Botões de Navegação */}
      <div className="flex items-center justify-between">
        <Link 
          href={`/dashboard/camaras/${camaraId}/vereadores/${vereadorId}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </Link>
      </div>

      {/* Header com Informações */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 font-rubik">Editar Vereador</h1>
        <p className="text-gray-500 mt-1">{vereador.name}</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna da Esquerda - Foto */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto
              </label>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-3 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Coluna da Direita - Campos de Texto */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Vereador">Vereador</option>
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="1º Secretário">1º Secretário</option>
                <option value="2º Secretário">2º Secretário</option>
              </select>
            </div>

            <div>
              <label htmlFor="partido" className="block text-sm font-medium text-gray-700 mb-1">
                Partido
              </label>
              <input
                type="text"
                id="partido"
                name="partido"
                value={formData.partido}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Campos de senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha (deixe em branco para manter a atual)
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmarSenha"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex justify-end space-x-4">
          <Link
            href={`/dashboard/camaras/${camaraId}/vereadores/${vereadorId}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditarVereadorPage({ params }: { params: Promise<{ id: string; vereadorId: string }> }) {
  const resolvedParams = use(params);
  return <EditarVereadorContent camaraId={resolvedParams.id} vereadorId={resolvedParams.vereadorId} />;
}