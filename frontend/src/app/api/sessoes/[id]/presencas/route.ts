import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Acessar params diretamente do objeto context
  const params = context.params;
  const sessaoId = params.id;
  
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/sessoes/${sessaoId}/presencas`;
    console.log('Fazendo requisição GET para:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store'
      }
    });
    
    console.log('Status da resposta do backend:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro ao carregar presenças [${response.status}]:`, errorText);
      return NextResponse.json(
        { error: `Erro ao carregar presenças: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Dados recebidos do backend:', data.length, 'presenças');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Erro ao processar a requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar a requisição' },
      { status: 500 }
    );
  }
}
