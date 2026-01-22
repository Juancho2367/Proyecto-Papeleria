const API_URL = 'http://localhost:5001/api';

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
  login: async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Error en login');
    return res.json();
  },

  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  },

  createProduct: async (product) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Error al crear producto');
    return res.json();
  },

  updateProduct: async (id, product) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Error al actualizar producto');
    return res.json();
  },
  
  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar producto');
    return res.json();
  },

  getSales: async () => {
    const res = await fetch(`${API_URL}/sales`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener ventas');
    return res.json();
  },

  createSale: async (saleData) => {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(saleData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear venta');
    return data;
  },

  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar usuario');
    return data;
  },

  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  },

  createCategory: async (categoryData) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear categoría');
    return data;
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar categoría');
    return res.json();
  }
};