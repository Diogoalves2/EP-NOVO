import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Garantir que params.id seja acessado corretamente
  const params = context.params;
  if (!params || !params.id) {
    return NextResponse.json(
      { error: 'ID da câmara não fornecido' },
      { status: 400 }
    );
  }

  // Acessar o parâmetro id diretamente
  const camaraId = params.id;

  try {
    // Obter token de autenticação dos cookies da requisição
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      console.error('Token de autenticação não encontrado');
    }
    
    // Aqui usamos a API de usuários com filtro por câmara_id
    const url = api.users.listByCamara(camaraId);
    
    console.log(`Buscando vereadores da câmara ${camaraId}: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      cache: 'no-store'
    });

    // Verificar se a resposta é JSON antes de tentar analisá-la
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Se não for JSON, obtenha o texto e retorne um erro
      const text = await response.text();
      console.error('Resposta não-JSON recebida:', text.substring(0, 100) + '...');
      return NextResponse.json(
        { error: 'A resposta da API não é um JSON válido' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Não autorizado - Token inválido ou expirado' }, { status: 401 });
      }
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar vereadores:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar vereadores' },
      { status: 500 }
    );
  }
} 