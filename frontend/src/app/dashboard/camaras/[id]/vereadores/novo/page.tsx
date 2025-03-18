'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { api } from '@/config/api';
import Cookies from 'js-cookie';
import { use } from 'react';

interface NovoVereadorForm {
  nome: string;
  email: string;
  senha: string;
  partido: string;
  cargo: 'Presidente' | 'Vice-Presidente' | '1º Secretário' | '2º Secretário' | 'Vereador';
  foto: File | null;
}

function NovoVereadorContent({ id }: { id: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewFoto, setPreviewFoto] = useState<string>('');
  const [formData, setFormData] = useState<NovoVereadorForm>({
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        foto: file
      }));
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validação dos campos
    if (!formData.nome || !formData.email || !formData.senha || !formData.partido || !formData.cargo) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      toast.error('Não autorizado');
      return;
    }

    try {
      setIsSubmitting(true);

      const data = new FormData();
      data.append('nome', formData.nome);
      data.append('email', formData.email);
      data.append('senha', formData.senha);
      data.append('partido', formData.partido);
      data.append('cargo', formData.cargo);
      data.append('camara_id', id);
      
      if (formData.foto) {
        data.append('foto', formData.foto);
      }

      console.log('Enviando dados:', Object.fromEntries(data.entries()));
      console.log('Arquivo:', formData.foto);

      const response = await fetch(api.users.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar vereador');
      }

      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);

      toast.success('Vereador criado com sucesso!');
      router.push(`/dashboard/camaras/${id}`);
    } catch (error: any) {
      console.error('Erro ao criar vereador:', error);
      toast.error(error.message || 'Erro ao criar vereador');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 font-rubik">Novo Vereador</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="partido" className="block text-sm font-medium text-gray-700 mb-1">
                Partido *
              </label>
              <input
                type="text"
                id="partido"
                name="partido"
                value={formData.partido}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                Cargo *
              </label>
              <select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Vereador">Vereador</option>
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="1º Secretário">1º Secretário</option>
                <option value="2º Secretário">2º Secretário</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto
              </label>
              <div className="flex items-center space-x-4">
                {previewFoto && (
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={previewFoto}
                      alt="Preview da foto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {formData.foto ? 'Trocar foto' : 'Selecionar foto'}
                  </span>
                  <input
                    type="file"
                    id="foto"
                    name="foto"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              </div>
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
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Criando...' : 'Criar Vereador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NovoVereadorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <NovoVereadorContent id={resolvedParams.id} />;
} 