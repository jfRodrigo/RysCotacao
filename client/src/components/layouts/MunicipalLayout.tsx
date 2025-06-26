import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Calculator, 
  User, 
  LayoutDashboard, 
  FileText, 
  Plus, 
  BarChart3, 
  Users, 
  Bell 
} from 'lucide-react';

interface MunicipalLayoutProps {
  children: ReactNode;
}

export const MunicipalLayout: React.FC<MunicipalLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/municipal/dashboard', icon: LayoutDashboard, current: location === '/municipal/dashboard' },
    { name: 'Minhas Cotações', href: '/municipal/quotations', icon: FileText, current: location === '/municipal/quotations' },
    { name: 'Nova Cotação', href: '/municipal/new-quotation', icon: Plus, current: location === '/municipal/new-quotation' },
    { name: 'Relatórios', href: '/municipal/reports', icon: BarChart3, current: location === '/municipal/reports' },
    { name: 'Equipe', href: '/municipal/team', icon: Users, current: location === '/municipal/team' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-municipal-blue rounded-lg flex items-center justify-center">
                  <Calculator className="text-white h-4 w-4" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">RysCotação</h1>
                  <p className="text-xs text-gray-500">Prefeitura Municipal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-municipal-green rounded-full flex items-center justify-center">
                  <User className="text-white h-4 w-4" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Gestor Municipal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-municipal-blue shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center px-3 py-4 text-sm font-medium transition-colors ${
                    item.current 
                      ? 'text-white border-b-2 border-municipal-green' 
                      : 'text-blue-200 hover:text-white'
                  }`}>
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
