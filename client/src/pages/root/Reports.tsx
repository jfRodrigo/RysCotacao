import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building, 
  FileText, 
  DollarSign,
  Download,
  Calendar,
  Activity
} from 'lucide-react';

export default function Reports() {
  const { data: municipalities } = useQuery({
    queryKey: ['/api/municipalities'],
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: quotations } = useQuery({
    queryKey: ['/api/quotations'],
  });

  const { data: accessLogs } = useQuery({
    queryKey: ['/api/access-logs'],
  });

  // Estatísticas gerais
  const totalMunicipalities = municipalities?.length || 0;
  const totalUsers = users?.length || 0;
  const totalQuotations = quotations?.length || 0;
  const totalVolume = quotations?.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0) || 0;

  // Estatísticas por status
  const pendingQuotations = quotations?.filter((q: any) => q.status === 'pendente').length || 0;
  const approvedQuotations = quotations?.filter((q: any) => q.status === 'aprovada').length || 0;
  const rejectedQuotations = quotations?.filter((q: any) => q.status === 'rejeitada').length || 0;

  // Top municípios por volume
  const municipalityVolumes = municipalities?.map((municipality: any) => {
    const municipalityQuotations = quotations?.filter((q: any) => q.municipalityId === municipality.id) || [];
    const volume = municipalityQuotations.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0);
    const count = municipalityQuotations.length;
    return {
      ...municipality,
      volume,
      count
    };
  }).sort((a: any, b: any) => b.volume - a.volume) || [];

  // Atividade recente por usuário
  const userActivity = users?.map((user: any) => {
    const userQuotations = quotations?.filter((q: any) => q.userId === user.id) || [];
    const userLogs = accessLogs?.filter((log: any) => log.userId === user.id) || [];
    return {
      ...user,
      quotationsCount: userQuotations.length,
      logsCount: userLogs.length,
      lastActivity: userLogs.length > 0 ? userLogs[0].timestamp : user.lastLogin
    };
  }).sort((a: any, b: any) => b.quotationsCount - a.quotationsCount) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMunicipalityName = (municipalityId: string) => {
    const municipality = municipalities?.find((m: any) => m.id === municipalityId);
    return municipality?.name || 'Desconhecido';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Gerenciais</h1>
          <p className="text-gray-600">Análise completa do sistema RysCotação</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button className="bg-admin-gold text-admin-blue hover:bg-yellow-500">
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
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="text-admin-blue h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{totalMunicipalities}</p>
                <p className="text-gray-600 text-sm">Municípios Ativos</p>
              </div>
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
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-gray-600 text-sm">Usuários Totais</p>
              </div>
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
                <p className="text-2xl font-bold text-gray-900">{totalQuotations}</p>
                <p className="text-gray-600 text-sm">Cotações Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-purple-600 h-6 w-6" />
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

      {/* Status das Cotações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Status das Cotações
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

        {/* Top Municípios */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Municípios por Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {municipalityVolumes.slice(0, 5).map((municipality: any, index: number) => (
                <div key={municipality.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-admin-blue font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {municipality.name.split(' ').slice(0, 3).join(' ')}
                      </p>
                      <p className="text-xs text-gray-500">{municipality.count} cotações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">
                      {formatCurrency(municipality.volume)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade dos Usuários */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Atividade dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Município
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cotações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acessos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Atividade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userActivity.slice(0, 10).map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.municipalityId ? getMunicipalityName(user.municipalityId) : 'Sistema (ROOT)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.quotationsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.logsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActivity ? formatDate(user.lastActivity) : 'Nunca'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}