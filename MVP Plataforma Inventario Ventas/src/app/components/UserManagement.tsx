import React, { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Users, Shield, UserPlus } from 'lucide-react';

export function UserManagement() {
  const { registerUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'worker'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData);
      // Reset form on success
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'worker'
      });
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 flex items-center">
          <Users className="w-10 h-10 mr-3" />
          Gestión de Usuarios
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Registra nuevos administradores o trabajadores para el sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
              Registrar Nuevo Usuario
            </CardTitle>
            <CardDescription>
              Completa los datos para dar de alta a un nuevo miembro del equipo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  placeholder="Ej. jperez"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 text-lg"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol del Usuario</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-slate-500" />
                        <span>Trabajador (Ventas)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-indigo-600" />
                        <span>Administrador (Acceso Total)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500 mt-1">
                  * Los trabajadores solo tienen acceso al módulo de Ventas e Inventario (lectura).
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? 'Creando Usuario...' : 'Crear Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card - Right Side */}
        <div className="space-y-6">
            <Card className="bg-indigo-50 border-indigo-100">
                <CardHeader>
                    <CardTitle className="text-indigo-900">Permisos por Rol</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Shield className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900">Administrador</h4>
                            <p className="text-sm text-indigo-700 mt-1">
                                Control total del sistema. Puede gestionar inventario (crear, editar, eliminar), ver reportes financieros, gestionar usuarios y configuraciones.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <Users className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">Trabajador</h4>
                            <p className="text-sm text-slate-700 mt-1">
                                Acceso limitado. Diseñado para la operación diaria: realizar ventas y consultar precios/stock. No puede modificar inventario ni ver métricas globales.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}