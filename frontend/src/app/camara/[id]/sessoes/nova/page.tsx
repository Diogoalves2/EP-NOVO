'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { api, apiPost } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { getToken } from '@/config/auth';

// Corrigindo os tipos de sessão para seguir o padrão solicitado
const TIPOS_SESSAO = {
  ordinaria: 'Sessão Ordinária',
  extraordinaria: 'Sessão Extraordinária',
  solene: 'Sessão Solene',
  especial: 'Sessão Especial',
  instalacao_legislatura: 'Sessão Solene de Instalação'
} as const;

export default function NovaSessaoPage({ params }: { params: { id: string } }) {
  // Use React.useMemo() para acessar params.id de forma segura
  const camaraId = React.useMemo(() => params.id, [params.id]);
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    
    // Garantindo que o tipo de sessão seja capturado corretamente
    const tipoSessao = formData.get('tipo')?.toString() || 'ordinaria';
    
    const data = {
      titulo: formData.get('titulo'),
      descricao: formData.get('descricao'),
      data: formData.get('data'),
      tipo: tipoSessao,
      camara_id: camaraId
    };

    console.log('Dados do formulário:', data); // Log para depuração

    try {
      console.log('URL da API:', api.sessoes.create);
      
      // Usar a função apiPost para enviar dados com autenticação
      const response = await apiPost(api.sessoes.create, data);
      
      if (response) {
        toast.success('Sessão criada com sucesso!');
        router.push(`/camara/${camaraId}/sessoes`);
      }
    } catch (error: any) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao criar sessão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto border rounded-lg">
        <CardHeader className="border-b bg-gray-50">
          <h1 className="text-2xl font-bold text-center text-gray-900">Nova Sessão</h1>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-gray-700 font-medium">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Digite o título da sessão"
                required
                className="w-full border-[1px] border-gray-300 rounded-md h-10 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-gray-700 font-medium">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Digite a descrição da sessão"
                required
                className="min-h-[100px] w-full border-[1px] border-gray-300 rounded-md text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="data" className="text-gray-700 font-medium">Data e Hora</Label>
                <Input
                  id="data"
                  name="data"
                  type="datetime-local"
                  required
                  className="w-full border-[1px] border-gray-300 rounded-md h-10 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-gray-700 font-medium">Tipo de Sessão</Label>
                <div className="relative h-10">
                  <select 
                    id="tipo"
                    name="tipo"
                    required
                    defaultValue="ordinaria"
                    className="w-full border-[1px] border-gray-300 rounded-md h-10 bg-white cursor-pointer text-gray-900 appearance-none pl-3 pr-10 absolute inset-0"
                  >
                    {Object.entries(TIPOS_SESSAO).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="cursor-pointer border-[1px] border-gray-300 text-gray-700 hover:bg-gray-50 h-10"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white h-10 border-[1px] border-blue-600"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 