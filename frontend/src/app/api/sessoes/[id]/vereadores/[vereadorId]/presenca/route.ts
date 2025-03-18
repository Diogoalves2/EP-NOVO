import { NextResponse } from 'next/server';
import { getToken } from '@/config/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string, vereadorId: string } }
) {
  try {
    const { id: sessaoId, vereadorId } = params;
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessoes/${sessaoId}/vereadores/${vereadorId}/presenca`;
    console.log('Fazendo requisição GET para:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao verificar presença:', errorText);
      return NextResponse.json(
        { error: 'Erro ao verificar presença' },
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

export async function POST(
  request: Request,
  { params }: { params: { id: string, vereadorId: string } }
) {
  try {
    const { id: sessaoId, vereadorId } = params;
    const token = getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }
    
    const body = await request.json().catch(() => ({}));
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessoes/${sessaoId}/vereadores/${vereadorId}/presenca`;
    console.log('Fazendo requisição POST para:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao registrar presença:', errorText);
      return NextResponse.json(
        { error: 'Erro ao registrar presença' },
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