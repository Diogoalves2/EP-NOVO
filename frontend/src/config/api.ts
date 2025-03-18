export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    logout: `${API_URL}/api/auth/logout`,
  },
  camaras: {
    list: `${API_URL}/api/camaras`,
    create: `${API_URL}/api/camaras`,
    get: (id: string) => `${API_URL}/api/camaras/${id}`,
    update: (id: string) => `${API_URL}/api/camaras/${id}`,
    delete: (id: string) => `${API_URL}/api/camaras/${id}`,
    addVereador: (id: string) => `${API_URL}/api/camaras/${id}/vereadores`,
    updateVereador: (camaraId: string, vereadorId: string) => 
      `${API_URL}/api/camaras/${camaraId}/vereadores/${vereadorId}`,
    deleteVereador: (camaraId: string, vereadorId: string) => 
      `${API_URL}/api/camaras/${camaraId}/vereadores/${vereadorId}`,
    stats: (id: string) => `${API_URL}/api/camaras/${id}/stats`,
  },
  sessoes: {
    list: `${API_URL}/api/sessoes`,
    listByCamara: (camaraId: string) => `${API_URL}/api/sessoes?camara_id=${camaraId}`,
    create: `${API_URL}/api/sessoes`,
    get: (id: string) => `${API_URL}/api/sessoes/${id}`,
    update: (id: string) => `${API_URL}/api/sessoes/${id}`,
    delete: (id: string) => `${API_URL}/api/sessoes/${id}`,
    iniciar: (id: string) => `${API_URL}/api/sessoes/${id}/iniciar`,
    finalizar: (id: string) => `${API_URL}/api/sessoes/${id}/finalizar`,
    cancelar: (id: string) => `${API_URL}/api/sessoes/${id}/cancelar`,
  },
  projetos: {
    list: `${API_URL}/api/projetos`,
    listByCamara: (camaraId: string) => `${API_URL}/api/projetos?camara_id=${camaraId}`,
    create: `${API_URL}/api/projetos`,
    get: (id: string) => `${API_URL}/api/projetos/${id}`,
    update: (id: string) => `${API_URL}/api/projetos/${id}`,
    delete: (id: string) => `${API_URL}/api/projetos/${id}`,
  },
  users: {
    list: `${API_URL}/api/users`,
    listByCamara: (camaraId: string) => `${API_URL}/api/users?camara_id=${camaraId}`,
    create: `${API_URL}/api/users`,
    get: (id: string) => `${API_URL}/api/users/${id}`,
    update: (id: string) => `${API_URL}/api/users/${id}`,
    delete: (id: string) => `${API_URL}/api/users/${id}`,
  },
  configuracoes: {
    get: `${API_URL}/api/configuracoes`,
    update: `${API_URL}/api/configuracoes`,
  },
  dashboard: {
    stats: `${API_URL}/api/dashboard/stats`
  },
  votos: {
    listar: (projetoId: string) => `${API_URL}/api/projetos/${projetoId}/votos`,
    contagem: (projetoId: string) => `${API_URL}/api/projetos/${projetoId}/contagem-votos`,
    registrar: (projetoId: string) => `${API_URL}/api/projetos/${projetoId}/votar`,
    iniciarVotacao: (projetoId: string) => `${API_URL}/api/projetos/${projetoId}/iniciar-votacao`,
    finalizarVotacao: (projetoId: string) => `${API_URL}/api/projetos/${projetoId}/finalizar-votacao`,
  }
}; 