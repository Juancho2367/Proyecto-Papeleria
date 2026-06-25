import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { 
  History, 
  Search, 
  RefreshCw, 
  FileText, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  DollarSign, 
  User, 
  Clock 
} from 'lucide-react';
import { toast } from 'sonner';

export function EventPanel() {
  const { events, fetchEvents } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await fetchEvents();
      toast.success('Historial de actividades actualizado');
    } catch (error) {
      toast.error('Error al actualizar historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Obtener lista única de usuarios para el filtro
  const uniqueUsers = Array.from(
    new Set(
      events
        .map((e) => e.user?.name)
        .filter((name): name is string => !!name)
    )
  );

  // Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'all' || event.action === actionFilter;
    const matchesUser = userFilter === 'all' || event.user?.name === userFilter;

    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Creación de Producto':
        return <PlusCircle className="w-5 h-5 text-emerald-600" />;
      case 'Actualización de Producto':
        return <Edit3 className="w-5 h-5 text-amber-500" />;
      case 'Eliminación de Producto':
        return <Trash2 className="w-5 h-5 text-rose-500" />;
      case 'Registro de Venta':
        return <DollarSign className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'Creación de Producto':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Actualización de Producto':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Eliminación de Producto':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Registro de Venta':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center">
            <History className="w-10 h-10 mr-3 text-indigo-900" />
            Auditoría de Actividades
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Monitorea en tiempo real quién realiza qué acciones en la plataforma.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-indigo-900 hover:bg-indigo-800 self-start sm:self-center h-12 text-base px-6 shadow-md"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refrescar Actividades
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buscador */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por detalle o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 text-base border-slate-200"
                />
              </div>
            </div>

            {/* Filtrar por Acción */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Filtrar por Acción</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-12 border-slate-200 text-base">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="Creación de Producto">Creación de Producto</SelectItem>
                  <SelectItem value="Actualización de Producto">Actualización de Producto</SelectItem>
                  <SelectItem value="Eliminación de Producto">Eliminación de Producto</SelectItem>
                  <SelectItem value="Registro de Venta">Registro de Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtrar por Usuario */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Filtrar por Usuario</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-12 border-slate-200 text-base">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <Card className="shadow-lg overflow-hidden border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-5">
          <CardTitle className="text-xl text-slate-900">Historial de Operaciones</CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Mostrando {filteredEvents.length} eventos recientes en orden cronológico.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <History className="w-16 h-16 mb-4 stroke-1 opacity-60" />
              <p className="text-lg font-medium">No se encontraron actividades</p>
              <p className="text-sm mt-1">Prueba a cambiar los filtros o recargar el feed.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredEvents.map((event) => (
                <div 
                  key={event._id || event.id} 
                  className="p-5 hover:bg-slate-50/80 transition-colors duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex-shrink-0 mt-0.5">
                      {getActionIcon(event.action)}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionBadgeColor(event.action)}`}>
                          {event.action}
                        </span>
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                          <User className="w-3.5 h-3.5 mr-1" />
                          {event.user?.name || 'Desconocido'} ({event.user?.role === 'admin' ? 'Admin' : 'Trabajador'})
                        </div>
                      </div>
                      <p className="text-slate-700 text-base font-medium leading-relaxed">
                        {event.details}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 font-medium md:self-center self-end flex-shrink-0 gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimestamp(event.createdAt || event.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
