import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  DollarSign,
  Download,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export default function MunicipalReports() {
  const { user } = useAuth();

  const { data: quotations } = useQuery({
    queryKey: ['/api/quotations'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Filtrar dados apenas do município do usuário
  const municipalQuotations = quotations?.filter((q: any) => q.municipalityId === user?.municipalityId) || [];
  const municipalUsers = users?.filter((u: any) => u.municipalityId === user?.municipalityId) || [];

  // Estatísticas gerais
  const totalQuotations = municipalQuotations.length;
  const totalVolume = municipalQuotations.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0);

  // Estatísticas por status
  const pendingQuotations = municipalQuotations.filter((q: any) => q.status === 'pendente').length;
  const approvedQuotations = municipalQuotations.filter((q: any) => q.status === 'aprovada').length;
  const rejectedQuotations = municipalQuotations.filter((q: any) => q.status === 'rejeitada').length;

  // Volume por status
  const approvedVolume = municipalQuotations
    .filter((q: any) => q.status === 'aprovada')
    .reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0);

  const pendingVolume = municipalQuotations
    .filter((q: any) => q.status === 'pendente')
    .reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0);

  // Atividade por usuário
  const userActivity = municipalUsers.map((municipalUser: any) => {
    const userQuotations = municipalQuotations.filter((q: any) => q.userId === municipalUser.id);
    const userVolume = userQuotations.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0);
    return {
      ...municipalUser,
      quotationsCount: userQuotations.length,
      volume: userVolume
    };
  }).sort((a: any, b: any) => b.quotationsCount - a.quotationsCount);

  // Cotações recentes
  const recentQuotations = municipalQuotations
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'rejeitada':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="px-4 sm:px-0 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise das cotações do seu município</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button className="bg-municipal-blue text-white hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-municipal-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="text-municipal-blue h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalQuotations}</p>
                <p className="text-gray-600 text-sm">Cotações Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{approvedQuotations}</p>
                <p className="text-gray-600 text-sm">Aprovadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600 h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{pendingQuotations}</p>
                <p className="text-gray-600 text-sm">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-municipal-green bg-opacity-10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-municipal-green h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalVolume).replace(/\D*(\d.*\d)\D*/, '$1')}
                </p>
                <p className="text-gray-600 text-sm">Volume Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status e Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Pendentes</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">{pendingQuotations}</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {totalQuotations > 0 ? Math.round((pendingQuotations / totalQuotations) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Aprovadas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">{approvedQuotations}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {totalQuotations > 0 ? Math.round((approvedQuotations / totalQuotations) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Rejeitadas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">{rejectedQuotations}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {totalQuotations > 0 ? Math.round((rejectedQuotations / totalQuotations) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Volume por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Aprovadas</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(approvedVolume)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {totalVolume > 0 ? Math.round((approvedVolume / totalVolume) * 100) : 0}% do total
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Pendentes</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatCurrency(pendingVolume)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {totalVolume > 0 ? Math.round((pendingVolume / totalVolume) * 100) : 0}% do total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade da Equipe */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Atividade da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma atividade registrada ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userActivity.map((userInfo: any) => (
                <div key={userInfo.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-municipal-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                      <Activity className="text-municipal-blue h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{userInfo.name}</p>
                      <p className="text-sm text-gray-500">{userInfo.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cotações:</span>
                      <span className="text-sm font-medium text-gray-900">{userInfo.quotationsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volume:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(userInfo.volume)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cotações Recentes */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Cotações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuotations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma cotação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentQuotations.map((quotation: any) => (
                <div key={quotation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(quotation.status)}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900 text-sm">
                        {quotation.product.substring(0, 50)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        {quotation.quantity} unidades • {formatDate(quotation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(parseFloat(quotation.totalPrice))}
                    </p>
                    <Badge className={getStatusColor(quotation.status)}>
                      {quotation.status}
                    </Badge>
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