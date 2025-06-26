import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, DollarSign, Plus, Eye, Edit } from 'lucide-react';
import { Link } from 'wouter';

export default function MunicipalDashboard() {
  const { user } = useAuth();

  const { data: quotations } = useQuery({
    queryKey: ['/api/quotations'],
  });

  const activeQuotations = quotations?.filter((q: any) => q.status === 'pendente').length || 0;
  const approvedQuotations = quotations?.filter((q: any) => q.status === 'aprovada').length || 0;
  const totalVolume = quotations?.reduce((sum: number, q: any) => sum + parseFloat(q.totalPrice || 0), 0) || 0;

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-gradient-to-r from-municipal-blue to-municipal-green rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name}!</h2>
          <p className="text-sm opacity-90">Gerencie as cotações do seu município de forma eficiente</p>
          <Link href="/municipal/new-quotation">
            <Button className="mt-4 bg-white text-municipal-blue hover:bg-gray-100">
              <Plus className="h-4 w-4 mr-2" />
              Nova Cotação
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-municipal-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FileText className="text-municipal-blue h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{activeQuotations}</p>
                  <p className="text-sm text-gray-600">Cotações Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-municipal-green bg-opacity-10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-municipal-green h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{approvedQuotations}</p>
                  <p className="text-sm text-gray-600">Aprovadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600 h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalVolume).replace(/\D*(\d.*\d)\D*/, '$1')}
                  </p>
                  <p className="text-sm text-gray-600">Volume Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cotações Table */}
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-gray-900">
                Cotações Recentes
              </CardTitle>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </Button>
                <Link href="/municipal/new-quotation">
                  <Button className="bg-municipal-blue text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Cotação
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!quotations || quotations.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma cotação encontrada</h3>
                <p className="text-gray-500 mb-4">Comece criando sua primeira cotação</p>
                <Link href="/municipal/new-quotation">
                  <Button className="bg-municipal-blue text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Cotação
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentQuotations.map((quotation: any) => (
                      <tr key={quotation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quotation.product}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quotation.quantity} unidades
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(quotation.totalPrice))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(quotation.status)}>
                            {quotation.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(quotation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
