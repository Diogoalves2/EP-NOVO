import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Obter corpo da requisição
    const body = await request.json();
    const { voto, vereador_id } = body;

    // Obtendo token de cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Verificações básicas
    if (!voto || !vereador_id) {
      return NextResponse.json(
        { error: 'Dados de voto inválidos' },
        { status: 400 }
      );
    }

    // Aguardando o objeto params antes de acessar suas propriedades
    const { id } = await Promise.resolve(context.params);
    const projetoId = id;

    // Verificar se o projeto existe
    try {
      const projetoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!projetoResponse.ok) {
        const errorData = await projetoResponse.json();
        return NextResponse.json(
          { error: errorData.error || 'Projeto não encontrado' },
          { status: 404 }
        );
      }

      // Verificar se o projeto está em votação
      const projeto = await projetoResponse.json();
      if (projeto.status !== 'em_votacao') {
        return NextResponse.json(
          { error: 'Este projeto não está aberto para votação' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Erro ao verificar projeto:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar projeto' },
        { status: 500 }
      );
    }

    // Registrar o voto
    try {
      const votoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projetos/${projetoId}/votar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            voto,
            vereador_id
          })
        }
      );

      const responseData = await votoResponse.json();

      if (!votoResponse.ok) {
        return NextResponse.json(
          { error: responseData.error || 'Erro ao registrar voto' },
          { status: votoResponse.status }
        );
      }

      return NextResponse.json(responseData);
    } catch (error: any) {
      console.error('Erro ao processar voto:', error);
      return NextResponse.json(
        { error: error.message || 'Erro ao processar voto' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro na rota de votação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 