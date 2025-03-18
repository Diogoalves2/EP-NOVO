import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/config/api';
import { getAuthHeader } from '@/config/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Usar React.useMemo para acessar params.id de forma segura
  const projetoId = React.useMemo ? React.useMemo(() => params.id, [params]) : params.id;
  
  console.log(`Buscando projeto com ID: ${projetoId}`);
  
  const projetoUrl = api.projetos.get(projetoId);
  console.log(`URL da API: ${projetoUrl}`);

  try {
    const response = await fetch(projetoUrl, {
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorStatus = response.status;
      console.error(`Erro ao buscar projeto. Status: ${errorStatus}`);
      return NextResponse.json(
        { error: `Erro ao buscar projeto: ${errorStatus}` },
        { status: errorStatus }
      );
    }

    const projeto = await response.json();
    return NextResponse.json(projeto);
  } catch (error: any) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Implementação do DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Usar React.useMemo para acessar params.id de forma segura
  const projetoId = React.useMemo ? React.useMemo(() => params.id, [params]) : params.id;

  try {
    // Obter token dos cookies
    const token = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Construir URL para API
    const projetoUrl = api.projetos.delete(projetoId);

    // Enviar requisição DELETE para o backend
    const response = await fetch(projetoUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Verificar resposta
    if (!response.ok) {
      const errorStatus = response.status;
      console.error(`Erro ao excluir projeto. Status: ${errorStatus}`);
      return NextResponse.json(
        { error: `Erro ao excluir projeto: ${errorStatus}` },
        { status: errorStatus }
      );
    }

    // Retornar sucesso
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 