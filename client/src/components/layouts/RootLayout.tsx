import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  Crown, 
  LayoutDashboard, 
  Building, 
  Users, 
  FileText, 
  BarChart3, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  Plus 
} from 'lucide-react';

interface RootLayoutProps {
  children: ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/root/dashboard', icon: LayoutDashboard, current: location === '/root/dashboard' },
    { name: 'Municípios', href: '/root/municipalities', icon: Building, current: location === '/root/municipalities', badge: '12' },
    { name: 'Usuários', href: '/root/users', icon: Users, current: location === '/root/users', badge: '87' },
    { name: 'Cotações', href: '/root/quotations', icon: FileText, current: location === '/root/quotations', badge: '234' },
    { name: 'Relatórios', href: '/root/reports', icon: BarChart3, current: location === '/root/reports' },
    { name: 'Logs de Acesso', href: '/root/access-logs', icon: History, current: location === '/root/access-logs' },
    { name: 'Configurações', href: '/root/settings', icon: Settings, current: location === '/root/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-admin-blue shadow-xl">
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="flex h-16 items-center px-6 bg-admin-blue border-b border-blue-800">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-admin-gold rounded-lg flex items-center justify-center">
                <Calculator className="text-admin-blue h-4 w-4" />
              </div>
              <div className="ml-3">
                <h1 className="text-white font-bold text-lg">RysCotação</h1>
                <p className="text-blue-300 text-xs">Inteligente</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="px-6 py-4 border-b border-blue-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-admin-gold rounded-full flex items-center justify-center">
                <Crown className="text-admin-blue h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-blue-300 text-sm">Administrador ROOT</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    item.current 
                      ? 'text-white bg-blue-700' 
                      : 'text-blue-200 hover:text-white hover:bg-blue-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                    <span className="ml-3 font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-admin-gold text-admin-blue text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-blue-800">
            <Button
              variant="ghost"
              className="flex items-center w-full px-4 py-2 text-blue-200 hover:text-white hover:bg-blue-700 rounded-lg transition-colors"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pl-72">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h2>
                <p className="text-gray-600">Visão geral do sistema RysCotação</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>
                <Button className="bg-admin-gold text-admin-blue hover:bg-yellow-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Município
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
