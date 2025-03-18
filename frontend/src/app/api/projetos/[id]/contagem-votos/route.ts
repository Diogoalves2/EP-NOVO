import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Aguardando o objeto params antes de acessar suas propriedades
    const { id } = await Promise.resolve(context.params);
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID do projeto não fornecido' },
        { status: 400 }
      );
    }
    
    const projetoId = id;
    const url = api.votos.contagem(projetoId);
    
    console.log(`Buscando contagem de votos do projeto: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao buscar contagem de votos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar contagem de votos' },
      { status: 500 }
    );
  }
} 