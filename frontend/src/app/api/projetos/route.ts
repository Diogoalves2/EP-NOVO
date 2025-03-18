import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const searchParams = request.nextUrl.searchParams;
    const sessaoId = searchParams.get('sessao_id');
    const camaraId = searchParams.get('camara_id');
    
    // Obter token de autenticação
    const token = request.cookies.get('token')?.value;
    
    let url = '';
    
    // Construir URL com base nos parâmetros disponíveis
    if (sessaoId) {
      // Buscar projetos por sessão
      url = `${api.projetos.list}?sessao_id=${sessaoId}`;
    } else if (camaraId) {
      // Buscar projetos por câmara
      url = api.projetos.listByCamara(camaraId);
    } else {
      // Buscar todos os projetos
      url = api.projetos.list;
    }
    
    console.log(`Redirecionando para a URL do backend: ${url}`);
    
    // Fazer requisição para o backend
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    if (!response.ok) {
      // Repassar código de status e mensagem do backend
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
} 