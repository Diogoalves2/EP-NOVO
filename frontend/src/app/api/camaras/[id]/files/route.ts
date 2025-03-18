import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config/api';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const formData = await request.formData();
    
    console.log('PUT Files - Atualizando arquivos da câmara com ID:', params.id);
    
    const response = await fetch(`${API_URL}/camaras/${params.id}/files`, {
      method: 'PUT',
      body: formData
    });
    
    console.log('PUT Files - Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PUT Files - Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      throw new Error(`Erro ao atualizar arquivos: ${response.status}`);
    }

    const data = await response.json();
    console.log('PUT Files - Arquivos atualizados com sucesso:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('PUT Files - Erro ao atualizar arquivos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar arquivos' },
      { status: error.status || 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 