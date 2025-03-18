import { getToken } from '@/config/auth';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Endpoints da API
export const api = {
  auth: {
    login: `${BASE_URL}/api/auth/login`,
    register: `${BASE_URL}/api/auth/register`,
    logout: `${BASE_URL}/api/auth/logout`,
  },
  camaras: {
    list: `${BASE_URL}/api/camaras`,
    create: `${BASE_URL}/api/camaras`,
    get: (id: string) => `${BASE_URL}/api/camaras/${id}`,
    update: (id: string) => `${BASE_URL}/api/camaras/${id}`,
    delete: (id: string) => `${BASE_URL}/api/camaras/${id}`,
    addVereador: (id: string) => `${BASE_URL}/api/camaras/${id}/vereadores`,
    updateVereador: (camaraId: string, vereadorId: string) => 
      `${BASE_URL}/api/camaras/${camaraId}/vereadores/${vereadorId}`,
    deleteVereador: (camaraId: string, vereadorId: string) => 
      `${BASE_URL}/api/camaras/${camaraId}/vereadores/${vereadorId}`,
    stats: (id: string) => `${BASE_URL}/api/camaras/${id}/stats`,
  },
  sessoes: {
    list: `${BASE_URL}/api/sessoes`,
    listByCamara: (camaraId: string) => `${BASE_URL}/api/sessoes?camara_id=${camaraId}`,
    create: `${BASE_URL}/api/sessoes`,
    get: (id: string) => `${BASE_URL}/api/sessoes/${id}`,
    update: (id: string) => `${BASE_URL}/api/sessoes/${id}`,
    delete: (id: string) => `${BASE_URL}/api/sessoes/${id}`,
  },
  projetos: {
    list: `${BASE_URL}/api/projetos`,
    listByCamara: (camaraId: string) => `${BASE_URL}/api/projetos?camara_id=${camaraId}`,
    create: `${BASE_URL}/api/projetos`,
    get: (id: string) => `${BASE_URL}/api/projetos/${id}`,
    update: (id: string) => `${BASE_URL}/api/projetos/${id}`,
    delete: (id: string) => `${BASE_URL}/api/projetos/${id}`,
  },
  users: {
    list: `${BASE_URL}/api/users`,
    create: `${BASE_URL}/api/users`,
    get: (id: string) => `${BASE_URL}/api/users/${id}`,
    update: (id: string) => `${BASE_URL}/api/users/${id}`,
    delete: (id: string) => `${BASE_URL}/api/users/${id}`,
  },
  configuracoes: {
    get: `${BASE_URL}/api/configuracoes`,
    update: `${BASE_URL}/api/configuracoes`,
  },
  dashboard: {
    get: `${BASE_URL}/api/dashboard`,
  },
} as const;

// Funções auxiliares para chamadas de API autenticadas
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('Não autenticado');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await fetchWithAuth(url);
  
  if (!response.ok) {
    throw new Error(`Erro ao obter dados: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
};

export const apiPost = async <T>(url: string, data: any): Promise<T> => {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao enviar dados: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
};

export const apiPut = async <T>(url: string, data: any): Promise<T> => {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao atualizar dados: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao excluir dados: ${response.status}`);
  }
  
  return response.json() as Promise<T>;
}; 