const API_URL = import.meta.env.VITE_API_URL || 'https://proyecto-papeleria-back.vercel.app/api';

const translateError = (message: string): string => {
  const dictionary: Record<string, string> = {
    'Invalid email or password': 'Usuario y/o contraseña incorrectos',
    'User already exists': 'El nombre de usuario ya está registrado',
    'Invalid user data': 'Los datos del usuario son inválidos o están incompletos',
    'Error en login': 'Error al iniciar sesión',
    'Error en registro': 'Error al registrar el usuario'
  };
  return dictionary[message] || message;
};

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (user && user.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  return headers;
};

export const api = {
  login: async (username: string, password: string): Promise<any> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(translateError(data.message || 'Error en login'));
    return data;
  },

  getProducts: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/products`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  },

  createProduct: async (product: any): Promise<any> => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Error al crear producto');
    return res.json();
  },

  updateProduct: async (id: string, product: any): Promise<any> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Error al actualizar producto');
    return res.json();
  },
  
  deleteProduct: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar producto');
    return res.json();
  },

  getSales: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/sales`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener ventas');
    return res.json();
  },

  createSale: async (saleData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(saleData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear venta');
    return data;
  },

  register: async (userData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(translateError(data.message || 'Error al registrar usuario'));
    return data;
  },

  getCategories: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/categories`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  },

  createCategory: async (categoryData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear categoría');
    return data;
  },

  deleteCategory: async (id: string): Promise<any> => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar categoría');
    return res.json();
  },

  getEvents: async (): Promise<any[]> => {
    const res = await fetch(`${API_URL}/events`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener el historial de eventos');
    return res.json();
  }
};