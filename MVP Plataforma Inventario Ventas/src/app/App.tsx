import React, { useState } from 'react';
import { AppProvider, useApp } from '@/app/contexts/AppContext';
import { Login } from '@/app/components/Login';
import { Sidebar } from '@/app/components/Sidebar';
import { Dashboard } from '@/app/components/Dashboard';
import { Inventory } from '@/app/components/Inventory';
import { Sales } from '@/app/components/Sales';
import { Statistics } from '@/app/components/Statistics';
import { Settings } from '@/app/components/Settings';
import { UserManagement } from '@/app/components/UserManagement';
import { DailySummary } from '@/app/components/DailySummary';
import { Toaster } from '@/app/components/ui/sonner';

function AppContent() {
  const { user } = useApp();
  const [activeView, setActiveView] = useState(user?.role === 'worker' ? 'sales' : 'dashboard');

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'daily-summary':
        return <DailySummary />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'statistics':
        return <Statistics />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto w-full">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}