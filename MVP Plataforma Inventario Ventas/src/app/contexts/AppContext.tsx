import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

// Types
export type UserRole = 'admin' | 'worker';

export interface User {
  id: string;
  _id?: string;
  name: string;
  username: string;
  role: UserRole;
  token?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  barcode: string;
  category: string | { _id: string, name: string }; // Populated or ID
  price: number; // For frontend compatibility (mapped from salePrice)
  salePrice?: number;
  costPrice?: number;
  stock: number;
  minStock: number; // For frontend compatibility (mapped from minStockThreshold)
  minStockThreshold?: number;
  description?: string;
}

export interface Sale {
  id: string;
  _id?: string;
  products: Array<{
    productId: string;
    productName?: string; // Optional in backend response
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: 'cash' | 'transfer';
  cashReceived?: number;
  change?: number;
  workerId?: string; // Backend uses seller
  seller?: { name: string };
  workerName?: string;
  date: string;
}

interface AppContextType {
  user: User | null;
  products: Product[];
  sales: Sale[];
  categories: Category[];
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | '_id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: any) => Promise<void>;
  getProductByBarcode: (barcode: string) => Product | undefined;
  refreshData: () => Promise<void>;
  registerUser: (userData: any) => Promise<void>;
  addCategory: (name: string, description?: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch data when user is logged in
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setProducts([]);
      setSales([]);
      setCategories([]);
    }
  }, [user]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [productsData, salesData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getSales().catch(() => []), // Catch error if worker cannot see all sales
        api.getCategories().catch(() => [])
      ]);

      // Map backend product to frontend interface
      const mappedProducts = productsData.map((p: any) => ({
        ...p,
        id: p._id,
        price: p.salePrice,
        minStock: p.minStockThreshold,
        category: p.category?.name || p.category // Handle populated or not
      }));

      // Map backend sales to frontend interface
      const mappedSales = salesData.map((s: any) => ({
        ...s,
        id: s._id,
        total: s.totalAmount,
        workerName: s.seller?.name || 'Desconocido',
        workerId: s.seller?._id || s.seller, // Ensure workerId is mapped
        products: s.products.map((sp: any) => ({
          productId: sp.product,
          quantity: sp.quantity,
          price: sp.priceAtSale
        }))
      }));

      const mappedCategories = categoriesData.map((c: any) => ({
        ...c,
        id: c._id
      }));

      setProducts(mappedProducts);
      setSales(mappedSales);
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't clear products if sales fail (e.g. worker role)
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(username, password);
      const userData = { ...data, id: data._id };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setProducts([]);
    setSales([]);
    setCategories([]);
  };

  const addProduct = async (productData: Omit<Product, 'id' | '_id'>) => {
    try {
      // Convert to backend format
      const payload = {
        ...productData,
        salePrice: productData.price,
        minStockThreshold: productData.minStock
      };
      await api.createProduct(payload);
      toast.success('Producto creado');
      refreshData();
    } catch (error) {
      toast.error('Error al crear producto');
      console.error(error);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
       // Convert to backend format if needed
       const payload: any = { ...updates };
       if (updates.price) payload.salePrice = updates.price;
       if (updates.minStock) payload.minStockThreshold = updates.minStock;

      await api.updateProduct(id, payload);
      toast.success('Producto actualizado');
      refreshData();
    } catch (error) {
      toast.error('Error al actualizar producto');
      console.error(error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      toast.success('Producto eliminado');
      refreshData();
    } catch (error) {
      toast.error('Error al eliminar producto');
      console.error(error);
    }
  };

  const addSale = async (saleData: any) => {
    try {
      await api.createSale(saleData);
      toast.success('Venta registrada');
      refreshData();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar venta');
      console.error(error);
      throw error; // Propagate to component
    }
  };

  const registerUser = async (userData: any) => {
    try {
      await api.register(userData);
      toast.success('Usuario registrado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar usuario');
      console.error(error);
      throw error;
    }
  };

  const addCategory = async (name: string, description?: string) => {
    try {
      await api.createCategory({ name, description });
      toast.success('Categoría creada');
      refreshData();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear categoría');
      throw error;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      toast.success('Categoría eliminada');
      refreshData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar categoría');
      throw error;
    }
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(p => p.barcode === barcode);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        sales,
        categories,
        loading,
        login,
        logout,
        addProduct,
        updateProduct,
        deleteProduct,
        addSale,
        getProductByBarcode,
        refreshData,
        registerUser,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}