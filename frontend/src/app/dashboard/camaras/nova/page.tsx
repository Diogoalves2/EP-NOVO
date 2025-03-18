'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { api } from '@/config/api';
import Cookies from 'js-cookie';

interface Vereador {
  nome: string;
  email: string;
  senha: string;
  partido: string;
  cargo: 'Presidente' | 'Vice-Presidente' | '1º Secretário' | '2º Secretário' | 'Vereador';
  foto: File | null;
}

interface CamaraForm {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  site: string;
  logo: File | null;
  regimento_interno: File | null;
  vereadores: Vereador[];
}

export default function NovaCamaraPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<CamaraForm>({
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    site: '',
    logo: null,
    regimento_interno: null,
    vereadores: []
  });

  const [novoVereador, setNovoVereador] = useState<Vereador>({
    nome: '',
    email: '',
    senha: '',
    partido: '',
    cargo: 'Vereador',
    foto: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleVereadorInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNovoVereador(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVereadorFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNovoVereador(prev => ({
        ...prev,
        foto: e.target.files![0]
      }));
    }
  };

  const adicionarVereador = (e: React.FormEvent) => {
    e.preventDefault();

    if (!novoVereador.nome || !novoVereador.email || !novoVereador.senha || !novoVereador.partido) {
      toast.error('Preencha todos os campos obrigatórios do vereador');
      return;
    }

    setFormData(prev => ({
      ...prev,
      vereadores: [...prev.vereadores, novoVereador]
    }));

    setNovoVereador({
      nome: '',
      email: '',
      senha: '',
      partido: '',
      cargo: 'Vereador',
      foto: null
    });

    const fileInput = document.querySelector('input[name="foto_vereador"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    toast.success('Vereador adicionado com sucesso!');
  };

  const removerVereador = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vereadores: prev.vereadores.filter((_, i) => i !== index)
    }));
    toast.success('Vereador removido com sucesso!');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validação dos campos da câmara
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.endereco) newErrors.endereco = 'Endereço é obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.estado) newErrors.estado = 'Estado é obrigatório';
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';
    if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.logo) newErrors.logo = 'Logo é obrigatória';
    if (!formData.regimento_interno) newErrors.regimento_interno = 'Regimento Interno é obrigatório';
    
    if (formData.vereadores.length === 0) {
      newErrors.vereadores = 'Adicione pelo menos um vereador';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Não autorizado');
      }

      const formDataToSend = new FormData();

      // Adiciona todos os campos de texto da câmara
      const textFields = {
        nome: formData.nome,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        telefone: formData.telefone,
        email: formData.email,
        site: formData.site
      };

      // Adiciona campos de texto
      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      // Adiciona os arquivos da câmara
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      if (formData.regimento_interno) {
        formDataToSend.append('regimentoInterno', formData.regimento_interno);
      }

      // Prepara os dados dos vereadores sem as fotos
      const vereadoresToSend = formData.vereadores.map(vereador => ({
        nome: vereador.nome,
        email: vereador.email,
        senha: vereador.senha,
        partido: vereador.partido,
        cargo: vereador.cargo
      }));

      // Adiciona os dados dos vereadores como uma string JSON
      formDataToSend.append('vereadores', JSON.stringify(vereadoresToSend));

      // Adiciona as fotos dos vereadores separadamente
      formData.vereadores.forEach((vereador, index) => {
        if (vereador.foto) {
          formDataToSend.append(`foto_vereador_${index}`, vereador.foto);
        }
      });

      console.log('URL da requisição:', api.camaras.create);
      console.log('Token:', token ? 'Presente' : 'Ausente');
      console.log('Dados sendo enviados:', {
        vereadores: vereadoresToSend,
        campos: Object.fromEntries(formDataToSend.entries())
      });

      const response = await fetch(api.camaras.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.log('Texto da resposta de erro:', responseText);
        
        let errorMessage = 'Erro ao criar câmara';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError);
          if (responseText.includes('Unexpected field')) {
            errorMessage = 'Erro no envio dos arquivos. Por favor, verifique os formatos e tamanhos permitidos.';
          } else {
            errorMessage = responseText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Resposta de sucesso:', responseData);

      toast.success('Câmara criada com sucesso!');
      router.push('/dashboard/camaras?refresh=' + new Date().getTime());
    } catch (error: any) {
      console.error('Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      let errorMessage = 'Erro ao criar câmara';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RequiredField = () => (
    <span className="text-red-500 ml-1" title="Campo obrigatório">*</span>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <Link 
          href="/dashboard/camaras"
          className="text-[#14213D] hover:text-[#2563eb] transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#14213D] font-rubik">Nova Câmara</h1>
          <p className="text-[#14213D]/60 mt-1 font-lato">Cadastre uma nova câmara no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 p-8 hover:border-[#2563eb]/20 transition-colors">
          <h2 className="text-xl font-bold text-[#14213D] font-rubik mb-2">Informações Básicas</h2>
          <p className="text-sm text-[#14213D]/60 mb-8 font-lato">Os campos marcados com <span className="text-red-500">*</span> são obrigatórios</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Nome da Câmara
                <RequiredField />
              </label>
              <input
                type="text"
                name="nome"
                className={`w-full h-14 px-4 rounded-lg border ${errors.nome ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="Ex: Câmara Municipal de São Paulo"
                value={formData.nome}
                onChange={handleInputChange}
                required
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-500">{errors.nome}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Endereço
                <RequiredField />
              </label>
              <input
                type="text"
                name="endereco"
                className={`w-full h-14 px-4 rounded-lg border ${errors.endereco ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="Rua, número e complemento"
                value={formData.endereco}
                onChange={handleInputChange}
                required
              />
              {errors.endereco && (
                <p className="mt-1 text-sm text-red-500">{errors.endereco}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Cidade
                <RequiredField />
              </label>
              <input
                type="text"
                name="cidade"
                className={`w-full h-14 px-4 rounded-lg border ${errors.cidade ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="Nome da cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                required
              />
              {errors.cidade && (
                <p className="mt-1 text-sm text-red-500">{errors.cidade}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Estado
                <RequiredField />
              </label>
              <select
                name="estado"
                className={`w-full h-14 px-4 rounded-lg border ${errors.estado ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato cursor-pointer`}
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecione um estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
              {errors.estado && (
                <p className="mt-1 text-sm text-red-500">{errors.estado}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                CEP
                <RequiredField />
              </label>
              <input
                type="text"
                name="cep"
                className={`w-full h-14 px-4 rounded-lg border ${errors.cep ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="00000-000"
                value={formData.cep}
                onChange={handleInputChange}
                required
              />
              {errors.cep && (
                <p className="mt-1 text-sm text-red-500">{errors.cep}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Telefone
                <RequiredField />
              </label>
              <input
                type="tel"
                name="telefone"
                className={`w-full h-14 px-4 rounded-lg border ${errors.telefone ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="(00) 0000-0000"
                value={formData.telefone}
                onChange={handleInputChange}
                required
              />
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-500">{errors.telefone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Email
                <RequiredField />
              </label>
              <input
                type="email"
                name="email"
                className={`w-full h-14 px-4 rounded-lg border ${errors.email ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="email@camara.gov.br"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Site
                <RequiredField />
              </label>
              <input
                type="url"
                name="site"
                className={`w-full h-14 px-4 rounded-lg border ${errors.site ? 'border-red-500' : 'border-[#E5E5E5]'} focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato`}
                placeholder="https://www.camara.gov.br"
                value={formData.site}
                onChange={handleInputChange}
              />
              {errors.site && (
                <p className="mt-1 text-sm text-red-500">{errors.site}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 p-8 hover:border-[#2563eb]/20 transition-colors">
          <h2 className="text-xl font-bold text-[#14213D] font-rubik mb-8">Arquivos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Logo da Câmara
                <RequiredField />
              </label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full text-sm text-[#14213D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb]/10 file:text-[#2563eb] hover:file:bg-[#2563eb]/20 ${errors.logo ? 'border-red-500' : ''}`}
                required
              />
              {errors.logo && (
                <p className="mt-1 text-sm text-red-500">{errors.logo}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">
                Regimento Interno
                <RequiredField />
              </label>
              <input
                type="file"
                name="regimento_interno"
                accept=".pdf"
                onChange={handleFileChange}
                className={`w-full text-sm text-[#14213D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb]/10 file:text-[#2563eb] hover:file:bg-[#2563eb]/20 ${errors.regimento_interno ? 'border-red-500' : ''}`}
                required
              />
              {errors.regimento_interno && (
                <p className="mt-1 text-sm text-red-500">{errors.regimento_interno}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 p-8 hover:border-[#2563eb]/20 transition-colors">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#14213D] font-rubik">Vereadores</h2>
            <button
              type="button"
              onClick={adicionarVereador}
              className="bg-[#2563eb] hover:bg-[#14213D] text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 font-lato inline-flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Adicionar Vereador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Nome</label>
              <input
                type="text"
                name="nome"
                value={novoVereador.nome}
                onChange={handleVereadorInputChange}
                className="w-full h-14 px-4 rounded-lg border border-[#E5E5E5] focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Email</label>
              <input
                type="email"
                name="email"
                value={novoVereador.email}
                onChange={handleVereadorInputChange}
                className="w-full h-14 px-4 rounded-lg border border-[#E5E5E5] focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Senha</label>
              <input
                type="password"
                name="senha"
                value={novoVereador.senha}
                onChange={handleVereadorInputChange}
                className="w-full h-14 px-4 rounded-lg border border-[#E5E5E5] focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato"
                placeholder="Senha de acesso"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Partido</label>
              <input
                type="text"
                name="partido"
                value={novoVereador.partido}
                onChange={handleVereadorInputChange}
                className="w-full h-14 px-4 rounded-lg border border-[#E5E5E5] focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato"
                placeholder="Sigla do partido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Cargo</label>
              <select
                name="cargo"
                value={novoVereador.cargo}
                onChange={handleVereadorInputChange}
                className="w-full h-14 px-4 rounded-lg border border-[#E5E5E5] focus:border-[#2563eb] focus:ring-[0.5px] focus:ring-[#2563eb] text-[#14213D] font-lato cursor-pointer"
              >
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="1º Secretário">1º Secretário</option>
                <option value="2º Secretário">2º Secretário</option>
                <option value="Vereador">Vereador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#14213D] mb-2 font-lato">Foto</label>
              <input
                type="file"
                name="foto_vereador"
                accept="image/*"
                onChange={handleVereadorFotoChange}
                className="w-full text-sm text-[#14213D] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2563eb]/10 file:text-[#2563eb] hover:file:bg-[#2563eb]/20"
              />
            </div>
          </div>

          {formData.vereadores.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#14213D] font-rubik mb-6">Vereadores Adicionados</h3>
              <div className="divide-y divide-[#E5E5E5]/50">
                {formData.vereadores.map((vereador, index) => (
                  <div key={index} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-[#14213D] font-lato">{vereador.nome}</p>
                      <p className="text-sm text-[#14213D]/60 font-lato">
                        {vereador.cargo} • {vereador.partido} • {vereador.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerVereador(index)}
                      className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard/camaras"
            className="px-6 py-2 rounded-lg border border-[#E5E5E5] text-[#14213D] hover:bg-[#14213D] hover:text-white transition-colors font-lato"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors font-lato flex items-center ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando...
              </>
            ) : (
              'Criar Câmara'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 