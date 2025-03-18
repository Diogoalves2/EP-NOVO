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
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessoes/${sessaoId}/presencas/todos-ausentes`;
    console.log('Fazendo requisição para:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao marcar todos como ausentes:', errorText);
      return NextResponse.json(
        { error: 'Erro ao marcar todos como ausentes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a requisição' },
      { status: 500 }
    );
  }
} 