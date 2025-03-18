import Cookies from 'js-cookie';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'vereador';
  partido?: string;
  cargo?: string;
  foto?: string | null;
  camara_id?: number;
}

export const getToken = (): string | null => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') {
    return null;
  }
  return Cookies.get(TOKEN_KEY) || null;
};

export const setToken = (token: string): void => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.set(TOKEN_KEY, token, { expires: 1 });
};

export const removeToken = (): void => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') {
    return;
  }
  Cookies.remove(TOKEN_KEY);
};

export const getUser = (): User | null => {
  // Verifica se estamos no navegador antes de acessar localStorage
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Erro ao parsear dados do usuário:', error);
    return null;
  }
};

export const setUser = (user: User): void => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  // Verifica se estamos no navegador
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const hasRole = (roles: string[]): boolean => {
  const user = getUser();
  if (!user) return false;
  return roles.includes(user.role);
};

export const logout = (): void => {
  removeToken();
  removeUser();
};

export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}; 