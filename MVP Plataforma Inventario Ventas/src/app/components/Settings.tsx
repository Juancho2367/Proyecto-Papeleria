import React, { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Settings as SettingsIcon, Trash2, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { products, sales } = useApp();

  const handleExportData = () => {
    const data = {
      products,
      sales,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `papeleria-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Datos exportados correctamente');
  };

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      toast.success('Datos eliminados. Recarga la página para restaurar datos de prueba.');
    }
  };

  const handleClearSales = () => {
    if (confirm('¿Estás seguro de que deseas eliminar el historial de ventas?')) {
      localStorage.removeItem('sales');
      toast.success('Historial de ventas eliminado. Recarga la página.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 flex items-center">
          <SettingsIcon className="w-10 h-10 mr-3" />
          Configuración
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Administrar datos y configuración del sistema
        </p>
      </div>

      {/* Data Management */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Gestión de Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Exportar Datos
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Descarga una copia de seguridad de todos los productos y ventas en formato JSON.
            </p>
            <Button onClick={handleExportData} variant="outline" className="h-12">
              <Download className="w-5 h-5 mr-2" />
              Exportar Backup
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
            <h3 className="font-medium text-slate-900 mb-2 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Limpiar Historial de Ventas
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Elimina el historial de ventas pero mantiene los productos. Útil para iniciar un nuevo período.
            </p>
            <Button 
              onClick={handleClearSales} 
              variant="outline" 
              className="h-12 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Limpiar Ventas
            </Button>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <h3 className="font-medium text-red-700 mb-2 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Eliminar Todos los Datos
            </h3>
            <p className="text-sm text-red-600 mb-4">
              ⚠️ Esta acción eliminará TODOS los datos almacenados (productos y ventas). No se puede deshacer.
            </p>
            <Button 
              onClick={handleClearData} 
              variant="destructive" 
              className="h-12"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Eliminar Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total de Productos</p>
              <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Total de Ventas</p>
              <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Valor Total del Inventario</p>
              <p className="text-2xl font-bold text-green-600">
                ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">
                ${sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Acerca del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <strong className="text-slate-900">Sistema de Gestión de Papelería v1.0</strong>
            </p>
            <p>
              MVP funcional diseñado para el manejo eficiente de inventario y ventas en negocios de papelería.
            </p>
            <div className="pt-4 border-t border-slate-200">
              <p className="font-medium text-slate-900 mb-2">Características:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Gestión completa de inventario por categorías</li>
                <li>Sistema de ventas con múltiples métodos de pago</li>
                <li>Calculadora de cambio integrada</li>
                <li>Lector de códigos de barras</li>
                <li>Alertas de stock bajo</li>
                <li>Estadísticas y métricas de negocio</li>
                <li>Sistema de roles (Administrador y Trabajador)</li>
                <li>Interfaz optimizada para pantallas táctiles</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Nota: Este es un MVP funcional. Para producción, conecta a tu backend con Express y MongoDB Atlas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
