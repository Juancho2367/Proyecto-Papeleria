import React, { useMemo } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export function Statistics() {
  const { sales, products } = useApp();

  // Calculate product sales stats
  const productStats = useMemo(() => {
    const stats = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    sales.forEach(sale => {
      sale.products.forEach(item => {
        const existing = stats.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          stats.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });

    return Array.from(stats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [sales]);

  // Calculate daily sales
  const dailySales = useMemo(() => {
    const salesByDate = new Map<string, number>();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      last7Days.push(dateStr);
      salesByDate.set(dateStr, 0);
    }

    sales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (salesByDate.has(date)) {
        salesByDate.set(date, salesByDate.get(date)! + sale.total);
      }
    });

    return last7Days.map(date => ({
      date,
      ventas: salesByDate.get(date) || 0,
    }));
  }, [sales]);

  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    
    products.forEach(product => {
      const existing = stats.get(product.category) || 0;
      stats.set(product.category, existing + product.stock);
    });

    return Array.from(stats.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Calculate worker performance
  const workerStats = useMemo(() => {
    const stats = new Map<string, { name: string; sales: number; revenue: number }>();
    
    sales.forEach(sale => {
      const existing = stats.get(sale.workerId);
      if (existing) {
        existing.sales += 1;
        existing.revenue += sale.total;
      } else {
        stats.set(sale.workerId, {
          name: sale.workerName,
          sales: 1,
          revenue: sale.total,
        });
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  // Calculate overall stats
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = sales.length;
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 flex items-center">
          <TrendingUp className="w-10 h-10 mr-3" />
          Estadísticas
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Análisis del rendimiento del negocio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">
                ${totalRevenue.toFixed(2)}
              </p>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-indigo-600">
                {totalSales}
              </p>
              <TrendingUp className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Venta Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-purple-600">
                ${averageSale.toFixed(2)}
              </p>
              <BarChart className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Productos en Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </p>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Ventas de los Últimos 7 Días</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  name="Ventas ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Top 10 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Bar 
                  dataKey="quantity" 
                  fill="#8b5cf6" 
                  name="Unidades Vendidas"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Distribución por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Worker Performance */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Rendimiento por Trabajador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workerStats.map((worker, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-900">{worker.name}</h4>
                    <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {worker.sales} ventas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Ingresos generados:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${worker.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {workerStats.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No hay datos de ventas disponibles
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Product Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Detalle de Ingresos por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-3 text-slate-700">Producto</th>
                  <th className="text-right p-3 text-slate-700">Unidades</th>
                  <th className="text-right p-3 text-slate-700">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productStats.map((product, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3">{product.name}</td>
                    <td className="p-3 text-right font-medium">{product.quantity}</td>
                    <td className="p-3 text-right font-bold text-green-600">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productStats.length === 0 && (
              <p className="text-center text-slate-500 py-8">
                No hay datos de ventas disponibles
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
