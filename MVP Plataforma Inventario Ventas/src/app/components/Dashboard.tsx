import React from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

// Colores para el gráfico de pastel
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Dashboard() {
  const { products, sales, user } = useApp();

  // --- Lógica de Procesamiento de Datos ---

  // 1. Ventas diarias (Últimos 30 días)
  const getLast30DaysSales = () => {
    const dailyMap = new Map();
    // Inicializar últimos 30 días en 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      dailyMap.set(key, 0);
    }
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const key = saleDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      if (dailyMap.has(key)) {
        dailyMap.set(key, dailyMap.get(key) + sale.total);
      }
    });

    return Array.from(dailyMap, ([date, total]) => ({ date, total }));
  };

  // 2. Productos por Categoría (Para PieChart)
  const getSalesByCategory = () => {
    const categoryCount: Record<string, number> = {};
    sales.forEach(sale => {
      sale.products.forEach(item => {
        // Asumiendo que item tiene información del producto o la buscamos
        // Si item.product es un ID, buscamos en products. Si ya es objeto, usamos .category
        // Ajuste: Dependiendo de cómo se guarde en Sales en el frontend context.
        // Asumiremos que item tiene productId o similar y cruzamos con products.
        // O si el contexto ya trae el producto populado.
        // En el archivo original: sale.products parecía tener length.
        // Verificaremos si sale.products tiene la info necesaria.
        // Por seguridad, intentaremos buscar el producto por ID si item.productId existe,
        // o usar item.category si existe.
        const prod = products.find(p => p.id === (item.productId || item.id)); 
        
        const categoryName = prod ? prod.category : 'Otros';
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + item.quantity;
      });
    });
    return Object.keys(categoryCount).map(key => ({ name: key, value: categoryCount[key] }));
  };

  // 3. Top Productos Vendidos
  const getTopProducts = () => {
    const productSales: Record<string, number> = {};
    sales.forEach(sale => {
      sale.products.forEach(item => {
        const prod = products.find(p => p.id === (item.productId || item.id));
        const prodName = prod ? prod.name : 'Desconocido';
        productSales[prodName] = (productSales[prodName] || 0) + item.quantity;
      });
    });
    return Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5
      .map(([name, quantity]) => ({ name, quantity }));
  };

  const chartData = getLast30DaysSales();
  const pieData = getSalesByCategory();
  const topProducts = getTopProducts();

  // Stats básicos
  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock < p.minStock);
  
  // Calcular ventas de HOY
  const todaySales = sales.filter(s => {
    const sDate = new Date(s.date);
    const today = new Date();
    return sDate.getDate() === today.getDate() &&
           sDate.getMonth() === today.getMonth() &&
           sDate.getFullYear() === today.getFullYear();
  });
  
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrativo</h1>
        <p className="text-slate-500">Vista general del rendimiento del negocio</p>
        {user && <p className="text-sm text-slate-400 mt-1">Hola, {user.name}</p>}
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Ventas Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-slate-400">{todaySales.length} transacciones</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-slate-400">Productos requieren atención</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Inventario Total</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-slate-400">Unidades en stock</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Ventas Históricas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-slate-400">Ventas registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras: Ventas Diarias */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ventas Últimos 30 Días</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tick={{fontSize: 10}} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Venta Total ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pastel: Ventas por Categoría */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Top Productos */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            Productos Más Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((prod, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-700">{prod.name}</span>
                </div>
                <div className="text-sm text-slate-500">{prod.quantity} unidades</div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-slate-500 text-sm">No hay datos suficientes aún.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}