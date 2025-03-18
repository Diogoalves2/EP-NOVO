import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config/api';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Login] Tentando fazer login com:', body);
    console.log('[Login] URL da API:', `${API_URL}/auth/login`);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      })
    });

    console.log('[Login] Status da resposta:', response.status);
    
    const responseText = await response.text();
    console.log('[Login] Resposta bruta:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[Login] Erro ao fazer parse da resposta:', e);
      return Response.json({ 
        error: 'Resposta inválida do servidor',
        details: responseText
      }, { status: 500 });
    }

    if (!response.ok) {
      console.error('[Login] Erro do servidor:', data);
      return Response.json(data, { status: response.status });
    }

    console.log('[Login] Login bem-sucedido:', data);

    // Criar resposta com o cookie
    const response2 = NextResponse.json(data);
    response2.cookies.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response2;
  } catch (error: any) {
    console.error('[Login] Erro inesperado:', error);
    return Response.json(
      { error: 'Erro ao processar login', details: error.message },
      { status: 500 }
    );
  }
} 