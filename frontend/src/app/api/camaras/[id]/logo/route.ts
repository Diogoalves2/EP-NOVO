import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const camaraId = params.id;
    
    // Buscar dados da câmara para obter o nome do arquivo de logo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/camaras/${camaraId}`);
    
    if (!response.ok) {
      console.error('Erro ao buscar dados da câmara:', response.statusText);
      return new NextResponse('Erro ao buscar dados da câmara', { status: response.status });
    }
    
    const camara = await response.json();
    if (!camara || !camara.logo) {
      console.error('Câmara não encontrada ou sem logo');
      return new NextResponse('Logo não encontrada', { status: 404 });
    }
    
    console.log('Logo encontrada:', camara.logo);
    
    // Tentar encontrar a imagem no servidor backend
    const logoUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${camara.logo}`;
    
    // Redirecionar para a URL da imagem no backend
    return NextResponse.redirect(logoUrl);
    
  } catch (error: any) {
    console.error('Erro ao processar logo da câmara:', error);
    return new NextResponse(`Erro ao processar logo: ${error.message}`, { status: 500 });
  }
} 