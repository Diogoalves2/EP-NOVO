import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Obter token dos cookies
    const cookieStore = request.cookies;
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Aguardando o objeto params antes de acessar suas propriedades
    const { id } = await Promise.resolve(context.params);
    const projetoId = id;

    // Construindo a URL para finalizar votação
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}/finalizar-votacao`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Erro ao finalizar votação' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao finalizar votação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno ao finalizar votação' },
      { status: 500 }
    );
  }
} 