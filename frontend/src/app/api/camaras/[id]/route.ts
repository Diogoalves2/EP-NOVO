import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';
import { getAuthHeader } from '@/config/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const camaraId = params.id;
    
    if (!camaraId) {
      return NextResponse.json(
        { error: 'ID da câmara não fornecido' },
        { status: 400 }
      );
    }
    
    console.log(`Buscando câmara com ID: ${camaraId}`);
    
    const camaraUrl = api.camaras.get(camaraId);
    console.log(`URL da API: ${camaraUrl}`);
    
    const response = await fetch(camaraUrl, {
      headers: {
        ...getAuthHeader(),
      },
    });
    
    if (!response.ok) {
      console.error(`Erro ao buscar câmara: ${response.status}`);
      return NextResponse.json(
        { error: 'Erro ao buscar câmara' }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar câmara:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados da câmara' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      throw new Error('Não autorizado: Token não encontrado');
    }

    // Pega o FormData da requisição
    const formData = await request.formData();
    
    // Log detalhado dos dados que estão sendo enviados
    console.log('PUT - Detalhes da requisição:', {
      id: params.id,
      url: `${api.camaras.get(params.id)}`,
      token: token.substring(0, 20) + '...',
      formDataKeys: Array.from(formData.keys())
    });

    // Envia a requisição para o backend
    const response = await fetch(api.camaras.get(params.id), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Não definimos Content-Type para que o browser defina automaticamente com o boundary correto
      },
      body: formData // Envia o FormData diretamente
    });

    // Log da resposta
    console.log('PUT - Status da resposta:', response.status);
    console.log('PUT - Headers:', Object.fromEntries(response.headers.entries()));

    // Tenta ler a resposta como texto primeiro
    const responseText = await response.text();
    console.log('PUT - Resposta bruta:', responseText);

    // Tenta fazer o parse do JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('PUT - Erro ao fazer parse da resposta:', e);
      throw new Error('Erro ao processar resposta do servidor');
    }

    if (!response.ok) {
      console.error('PUT - Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      if (response.status === 404) {
        throw new Error('Câmara não encontrada no sistema');
      }

      throw new Error(responseData.error || `Erro ao atualizar câmara: ${response.status}`);
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('PUT - Erro ao atualizar câmara:', error);
    
    let statusCode = 500;
    if (error.message.includes('não encontrada')) statusCode = 404;
    if (error.message.includes('Não autorizado')) statusCode = 401;
    
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar câmara' },
      { status: statusCode }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 