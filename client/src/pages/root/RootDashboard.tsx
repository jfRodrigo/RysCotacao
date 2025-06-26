import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, FileText, TrendingUp, CheckCircle, Database, AlertTriangle } from 'lucide-react';

export default function RootDashboard() {
  const { data: municipalities } = useQuery({
    queryKey: ['/api/municipalities'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: quotations } = useQuery({
    queryKey: ['/api/quotations'],
  });

  const municipalityCount = municipalities?.length || 0;
  const userCount = users?.length || 0;
  const quotationCount = quotations?.length || 0;
  const totalVolume = quotations?.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0) || 0;

  const recentMunicipalities = municipalities?.slice(0, 3) || [];
  const recentQuotations = quotations?.slice(0, 3) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejeitada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-admin-blue h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{municipalityCount}</p>
                <p className="text-gray-600 text-sm">Municípios Ativos</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2 este mês
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="text-green-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{userCount}</p>
                <p className="text-gray-600 text-sm">Usuários Totais</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15 este mês
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="text-admin-gold h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{quotationCount}</p>
                <p className="text-gray-600 text-sm">Cotações Ativas</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +28 esta semana
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalVolume)}
                </p>
                <p className="text-gray-600 text-sm">Volume Total</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% este mês
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Municipalities */}
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Municípios Recentes
              </CardTitle>
              <button className="text-admin-blue hover:text-blue-700 text-sm font-medium">
                Ver todos
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentMunicipalities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum município cadastrado ainda</p>
                </div>
              ) : (
                recentMunicipalities.map((municipality: any) => (
                  <div key={municipality.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="text-admin-blue h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{municipality.name}</p>
                        <p className="text-sm text-gray-600">CNPJ: {municipality.cnpj}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        Ativo
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(municipality.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="border border-gray-100">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Cotações Recentes
              </CardTitle>
              <button className="text-admin-blue hover:text-blue-700 text-sm font-medium">
                Ver todas
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentQuotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma cotação cadastrada ainda</p>
                </div>
              ) : (
                recentQuotations.map((quotation: any) => (
                  <div key={quotation.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-green-600 h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{quotation.product}</p>
                        <p className="text-sm text-gray-600">{quotation.quantity} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(parseFloat(quotation.totalPrice))}
                      </p>
                      <Badge className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Integration Status */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Status das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">n8n Webhook</p>
                <p className="text-sm text-green-600">Conectado</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Database className="text-white h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">PostgreSQL</p>
                <p className="text-sm text-green-600">Online</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-white h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">PNCP API</p>
                <p className="text-sm text-yellow-600">Limitado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
