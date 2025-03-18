import { NextResponse } from 'next/server';
import { getToken } from '@/config/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessaoId = params.id;
    const token = getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    const { vereadores } = body;
    
    if (!vereadores || !Array.isArray(vereadores)) {
      return NextResponse.json(
        { error: 'Lista de vereadores inválida' },
        { status: 400 }
      );
    }
    
    const resultados = [];
    
    // Registrar presença individualmente para cada vereador
    for (const vereador of vereadores) {
      const { id: vereadorId, presente } = vereador;
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessoes/${sessaoId}/vereadores/${vereadorId}/presenca`;
      console.log('Fazendo requisição para:', apiUrl, { presente });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ presente })
      });
      
      const result = await response.json();
      resultados.push({
        vereadorId,
        sucesso: response.ok,
        resultado: result
      });
    }
    
    return NextResponse.json({
      sucesso: true,
      resultados
    });
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a requisição' },
      { status: 500 }
    );
  }
} 