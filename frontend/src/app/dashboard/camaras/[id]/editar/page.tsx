'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { API_URL, api } from '@/config/api';
import Cookies from 'js-cookie';

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

function EditarCamaraContent({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [camara, setCamara] = useState<Partial<Camara>>({
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    site: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [regimentoFile, setRegimentoFile] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string>('');

  useEffect(() => {
    const fetchCamara = async () => {
      try {
        if (!id) {
          throw new Error('ID da câmara não fornecido');
        }

        const token = Cookies.get('token');
        if (!token) {
          throw new Error('Não autorizado');
        }

        console.log('Buscando câmara com ID:', id);
        const response = await fetch(api.camaras.get(id), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Log da resposta
        console.log('Status da resposta:', response.status);
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar dados da câmara');
        }

        // Verifica se os dados da câmara são válidos
        if (!data || !data.id) {
          throw new Error('Dados da câmara inválidos');
        }

        console.log('Câmara encontrada:', data);
        setCamara(data);
        if (data.logo) {
          const logoUrl = getFullUrl(data.logo);
          console.log('URL da logo:', logoUrl);
          setPreviewLogo(logoUrl);
        }
      } catch (error: any) {
        console.error('Erro ao buscar câmara:', error);
        setError(error.message || 'Erro ao carregar dados da câmara');
        toast.error(error.message || 'Erro ao carregar dados da câmara');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCamara();
    } else {
      setError('ID da câmara não fornecido');
      setIsLoading(false);
    }
  }, [id]);

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
    
    return `${baseUrl}/${finalPath}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCamara(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleRegimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegimentoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setError('ID da câmara não fornecido');
      toast.error('ID da câmara não fornecido');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      setError('Não autorizado');
      toast.error('Não autorizado');
      return;
    }

    // Validação de campos obrigatórios
    const requiredFields = ['nome', 'endereco', 'cidade', 'estado', 'cep', 'telefone', 'email'];
    for (const field of requiredFields) {
      if (!camara[field as keyof typeof camara]) {
        setError(`O campo ${field} é obrigatório`);
        toast.error(`O campo ${field} é obrigatório`);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      // Abordagem simplificada: usar apenas JSON para os dados básicos
      const jsonData = {
        nome: camara.nome || '',
        endereco: camara.endereco || '',
        cidade: camara.cidade || '',
        estado: camara.estado || '',
        cep: camara.cep || '',
        telefone: camara.telefone || '',
        email: camara.email || '',
        site: camara.site || ''
      };
      
      console.log('Atualizando dados básicos:', jsonData);
      
      const response = await fetch(api.camaras.update(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(responseData.error || 'Erro ao atualizar câmara');
      }
      
      console.log('Dados básicos atualizados com sucesso:', responseData);
      
      // Verificar se há arquivos para upload e executar cada upload em uma
      // operação separada
      const uploadsRealizados = [];
      let errosUpload = false;
      
      if (logoFile || regimentoFile) {
        if (logoFile) {
          try {
            await uploadLogo(id, logoFile, token);
            uploadsRealizados.push('logo');
          } catch (error) {
            console.error('Erro ao fazer upload do logo:', error);
            errosUpload = true;
          }
        }
        
        if (regimentoFile) {
          try {
            await uploadRegimento(id, regimentoFile, token);
            uploadsRealizados.push('regimento');
          } catch (error) {
            console.error('Erro ao fazer upload do regimento:', error);
            errosUpload = true;
          }
        }
      }
      
      if (errosUpload) {
        toast.error('Dados básicos salvos, mas houve erro ao enviar alguns arquivos');
      } else if (uploadsRealizados.length > 0) {
        toast.success(`Câmara e ${uploadsRealizados.join(' e ')} atualizados com sucesso!`);
      } else {
        toast.success('Câmara atualizada com sucesso!');
      }
      
      router.push(`/dashboard/camaras/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Função específica para upload do logo
  const uploadLogo = async (camaraId: string, file: File, token: string): Promise<void> => {
    console.log('Iniciando upload do logo:', file.name);
    
    const formData = new FormData();
    formData.append('logo', file);
    
    // Adicionar todos os campos necessários para validação
    formData.append('nome', camara.nome || '');
    formData.append('endereco', camara.endereco || '');
    formData.append('cidade', camara.cidade || '');
    formData.append('estado', camara.estado || '');
    formData.append('cep', camara.cep || '');
    formData.append('telefone', camara.telefone || '');
    formData.append('email', camara.email || '');
    formData.append('site', camara.site || '');
    
    // Endpoint de upload específico para logo
    const uploadUrl = `${API_URL}/api/camaras/${camaraId}/logo`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload do logo');
    }
    
    console.log('Logo atualizado com sucesso');
    return;
  };
  
  // Função específica para upload do regimento
  const uploadRegimento = async (camaraId: string, file: File, token: string): Promise<void> => {
    console.log('Iniciando upload do regimento:', file.name);
    
    const formData = new FormData();
    formData.append('regimentoInterno', file);
    
    // Adicionar todos os campos necessários para validação
    formData.append('nome', camara.nome || '');
    formData.append('endereco', camara.endereco || '');
    formData.append('cidade', camara.cidade || '');
    formData.append('estado', camara.estado || '');
    formData.append('cep', camara.cep || '');
    formData.append('telefone', camara.telefone || '');
    formData.append('email', camara.email || '');
    formData.append('site', camara.site || '');
    
    // Endpoint de upload específico para regimento
    const uploadUrl = `${API_URL}/api/camaras/${camaraId}/regimento`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer upload do regimento');
    }
    
    console.log('Regimento atualizado com sucesso');
    return;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !camara.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <Link 
          href="/dashboard/camaras"
          className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Voltar para lista de câmaras
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/camaras/${id}`}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 font-rubik">Editar Câmara</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Câmara
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={camara.nome}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={camara.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={camara.telefone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={camara.cep}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={camara.endereco}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={camara.cidade}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={camara.estado}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center space-x-4">
                {previewLogo && (
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={previewLogo}
                      alt="Preview da logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {logoFile ? 'Trocar logo' : 'Selecionar logo'}
                  </span>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regimento Interno
              </label>
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {regimentoFile ? 'Trocar arquivo' : 'Selecionar arquivo'}
                </span>
                <input
                  type="file"
                  id="regimentoInterno"
                  name="regimentoInterno"
                  accept=".pdf,.doc,.docx"
                  onChange={handleRegimentoChange}
                  className="hidden"
                />
              </label>
              {camara.regimento_interno && !regimentoFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo atual: {camara.regimento_interno.split('/').pop()}
                </p>
              )}
              {regimentoFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Novo arquivo: {regimentoFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href={`/dashboard/camaras/${id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditarCamaraPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <EditarCamaraContent id={resolvedParams.id} />;
} 