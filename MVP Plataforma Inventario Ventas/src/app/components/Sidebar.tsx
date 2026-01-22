import React, { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  Users,
  CalendarDays,
  Menu,
  X
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/app/components/ui/sheet';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, roles: ['admin'] },
    { id: 'daily-summary', label: 'Resumen Diario', icon: CalendarDays, roles: ['admin'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['admin', 'worker'] },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart, roles: ['admin', 'worker'] },
    { id: 'statistics', label: 'Estadísticas', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Usuarios', icon: Users, roles: ['admin'] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user!.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-indigo-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-2xl font-bold">Papelería</h1>
        <p className="text-sm text-indigo-300 mt-1">{user!.name}</p>
        <p className="text-xs text-indigo-400 capitalize">{user!.role === 'admin' ? 'Administrador' : 'Trabajador'}</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-4 rounded-lg transition-all duration-200 text-left",
                "hover:bg-indigo-800 active:scale-95",
                activeView === item.id
                  ? "bg-indigo-700 shadow-lg"
                  : "text-indigo-200"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-lg font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-indigo-800">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full bg-transparent border-indigo-600 text-white hover:bg-indigo-800 hover:text-white h-12 text-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-indigo-900 text-white flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-indigo-800">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80 border-r-indigo-800 bg-indigo-900 text-white">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-xl">Papelería</span>
        </div>
        <div className="text-right">
           <p className="text-sm font-medium">{user!.name}</p>
        </div>
      </div>
    </>
  );
}