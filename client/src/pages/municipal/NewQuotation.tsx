import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Save, 
  Calculator, 
  ArrowLeft, 
  Bot, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,

  Loader2
} from 'lucide-react';
import { useLocation } from 'wouter';

const quotationSchema = z.object({
  product: z.string().min(1, 'Produto é obrigatório').max(500, 'Máximo 500 caracteres'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
  unitPrice: z.number().min(0.01, 'Preço unitário deve ser maior que zero'),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function NewQuotation() {
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setLocation] = useLocation();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      product: '',
      quantity: 1,
      unitPrice: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/quotations', data),
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotations'] });
      toast({
        title: 'Cotação Criada com Sucesso',
        description: 'Análise de preços realizada e relatório gerado automaticamente',
      });
      setLocation('/municipal/quotations');
    },
    onError: (error: any) => {
      setIsAnalyzing(false);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar cotação',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: QuotationFormData) => {
    const totalPrice = data.quantity * data.unitPrice;
    createMutation.mutate({
      ...data,
      totalPrice: totalPrice.toFixed(2),
    });
  };

  // Calculate total price when quantity or unit price changes
  const watchedQuantity = form.watch('quantity');
  const watchedUnitPrice = form.watch('unitPrice');
  
  React.useEffect(() => {
    const total = watchedQuantity * watchedUnitPrice;
    setTotalPrice(total);
  }, [watchedQuantity, watchedUnitPrice]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isAnalyzing) {
    return (
      <div className="px-4 sm:px-0">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-municipal-blue bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-municipal-blue animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analisando Preços
              </h3>
              <p className="text-gray-600 mb-4">
                Nossa IA está analisando o mercado para gerar insights sobre seu produto
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando análise de preços...</span>
              </div>
              <div className="mt-6 space-y-2 text-xs text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Coletando dados de mercado</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span>Gerando relatório inteligente</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-3 w-3 text-gray-300" />
                  <span>Enviando notificação via webhook</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/municipal/quotations')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Cotação</h1>
            <p className="text-gray-600">
              Crie uma nova cotação com análise inteligente de preços
            </p>
          </div>
        </div>
      </div>

      {/* AI Analysis Features Banner */}
      <Card className="border-municipal-blue border-2 bg-municipal-blue bg-opacity-5">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-municipal-blue bg-opacity-10 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-municipal-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Análise Inteligente de Preços
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Nossa IA irá automaticamente analisar seu produto e gerar insights valiosos:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-municipal-green" />
                  <span className="text-gray-700">Preços de mercado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-municipal-green" />
                  <span className="text-gray-700">Análise comparativa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-municipal-green" />
                  <span className="text-gray-700">Relatório detalhado</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Dados da Cotação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição do Produto/Serviço *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva detalhadamente o produto ou serviço que você deseja cotar..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ex: 100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Unitário (R$) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Ex: 15.50"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-municipal-blue text-white hover:bg-blue-700"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando Cotação...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Criar Cotação com Análise IA
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Resumo da Cotação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-medium">{watchedQuantity.toLocaleString()} unidades</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preço unitário:</span>
                <span className="font-medium">{formatCurrency(watchedUnitPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-900">Valor Total:</span>
                <span className="font-bold text-municipal-blue">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                O que você vai receber
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Análise de Mercado</p>
                  <p className="text-green-600">Comparação com preços praticados no mercado</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Relatório Detalhado</p>
                  <p className="text-green-600">Documento completo para processo licitatório</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Recomendações</p>
                  <p className="text-green-600">Sugestões para otimização de custos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-green-800">Notificação Automática</p>
                  <p className="text-green-600">Webhook enviado para sistemas integrados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Importante</p>
                  <p className="text-yellow-700">
                    A análise de preços é baseada em dados de mercado e algoritmos de IA. 
                    Use como referência complementar em seus processos licitatórios.
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