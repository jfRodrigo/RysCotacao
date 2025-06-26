import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Save, 
  Key, 
  Globe, 
  Bell, 
  Shield,
  Database,
  Webhook,
  Mail
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Estados para configurações
  const [systemSettings, setSystemSettings] = useState({
    systemName: 'RysCotação Inteligente',
    systemEmail: 'admin@ryscotacao.com.br',
    supportEmail: 'suporte@ryscotacao.com.br',
    maxQuotationsPerUser: 100,
    autoApprovalLimit: 10000,
    sessionTimeout: 24
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    webhookNotifications: true,
    smsNotifications: false,
    newQuotationAlert: true,
    statusChangeAlert: true,
    systemMaintenanceAlert: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireStrongPassword: true,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    sessionLockAfterInactivity: true,
    auditLogRetentionDays: 365
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    n8nWebhookUrl: 'https://n8neditor.rs-cotacaodeopreco.online/webhook/8Hp0zOw28fPumRYp',
    n8nApiKey: '••••••••••••',
    pncpApiEnabled: false,
    comprasnetApiEnabled: false,
    backupFrequency: 'daily'
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', '/api/settings', data),
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar configurações',
        variant: 'destructive',
      });
    },
  });

  const handleSaveSettings = (section: string) => {
    let data;
    switch (section) {
      case 'system':
        data = { section: 'system', settings: systemSettings };
        break;
      case 'notifications':
        data = { section: 'notifications', settings: notificationSettings };
        break;
      case 'security':
        data = { section: 'security', settings: securitySettings };
        break;
      case 'integrations':
        data = { section: 'integrations', settings: integrationSettings };
        break;
      default:
        return;
    }
    
    // Simulando salvamento das configurações
    toast({
      title: 'Sucesso',
      description: 'Configurações salvas com sucesso',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais do RysCotação</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configurações Gerais */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">Nome do Sistema</Label>
              <Input
                id="systemName"
                value={systemSettings.systemName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, systemName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemEmail">Email do Sistema</Label>
              <Input
                id="systemEmail"
                type="email"
                value={systemSettings.systemEmail}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, systemEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input
                id="supportEmail"
                type="email"
                value={systemSettings.supportEmail}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuotations">Máximo de Cotações por Usuário</Label>
              <Input
                id="maxQuotations"
                type="number"
                value={systemSettings.maxQuotationsPerUser}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxQuotationsPerUser: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoApproval">Limite para Aprovação Automática (R$)</Label>
              <Input
                id="autoApproval"
                type="number"
                value={systemSettings.autoApprovalLimit}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, autoApprovalLimit: parseFloat(e.target.value) }))}
              />
            </div>
            <Button onClick={() => handleSaveSettings('system')} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações Gerais
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="strongPassword">Exigir Senha Forte</Label>
                <p className="text-sm text-gray-500">Mínimo 12 caracteres com símbolos</p>
              </div>
              <Switch
                id="strongPassword"
                checked={securitySettings.requireStrongPassword}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPassword: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="twoFactor">Autenticação de Dois Fatores</Label>
                <p className="text-sm text-gray-500">SMS ou aplicativo autenticador</p>
              </div>
              <Switch
                id="twoFactor"
                checked={securitySettings.enableTwoFactor}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Máximo de Tentativas de Login</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sessionLock">Bloquear Sessão por Inatividade</Label>
                <p className="text-sm text-gray-500">30 minutos de inatividade</p>
              </div>
              <Switch
                id="sessionLock"
                checked={securitySettings.sessionLockAfterInactivity}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, sessionLockAfterInactivity: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditRetention">Retenção de Logs de Auditoria (dias)</Label>
              <Input
                id="auditRetention"
                type="number"
                value={securitySettings.auditLogRetentionDays}
                onChange={(e) => setSecuritySettings(prev => ({ ...prev, auditLogRetentionDays: parseInt(e.target.value) }))}
              />
            </div>
            <Button onClick={() => handleSaveSettings('security')} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Segurança
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Configurações de Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotif">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Enviar alertas por email</p>
              </div>
              <Switch
                id="emailNotif"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="webhookNotif">Notificações via Webhook</Label>
                <p className="text-sm text-gray-500">Integração com n8n</p>
              </div>
              <Switch
                id="webhookNotif"
                checked={notificationSettings.webhookNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, webhookNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newQuotationAlert">Alerta de Nova Cotação</Label>
                <p className="text-sm text-gray-500">Notificar criação de cotações</p>
              </div>
              <Switch
                id="newQuotationAlert"
                checked={notificationSettings.newQuotationAlert}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newQuotationAlert: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="statusAlert">Alerta de Mudança de Status</Label>
                <p className="text-sm text-gray-500">Notificar aprovação/rejeição</p>
              </div>
              <Switch
                id="statusAlert"
                checked={notificationSettings.statusChangeAlert}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, statusChangeAlert: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceAlert">Alerta de Manutenção</Label>
                <p className="text-sm text-gray-500">Notificar atualizações do sistema</p>
              </div>
              <Switch
                id="maintenanceAlert"
                checked={notificationSettings.systemMaintenanceAlert}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemMaintenanceAlert: checked }))}
              />
            </div>
            <Button onClick={() => handleSaveSettings('notifications')} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Notificações
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Integração */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="h-5 w-5 mr-2" />
              Configurações de Integração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook n8n</Label>
              <Input
                id="webhookUrl"
                value={integrationSettings.n8nWebhookUrl}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, n8nWebhookUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave da API n8n</Label>
              <Input
                id="apiKey"
                type="password"
                value={integrationSettings.n8nApiKey}
                onChange={(e) => setIntegrationSettings(prev => ({ ...prev, n8nApiKey: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pncpApi">API do PNCP</Label>
                <p className="text-sm text-gray-500">Portal Nacional de Contratações Públicas</p>
              </div>
              <Switch
                id="pncpApi"
                checked={integrationSettings.pncpApiEnabled}
                onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, pncpApiEnabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="comprasnetApi">API do ComprasNet</Label>
                <p className="text-sm text-gray-500">Sistema de Compras Governamentais</p>
              </div>
              <Switch
                id="comprasnetApi"
                checked={integrationSettings.comprasnetApiEnabled}
                onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, comprasnetApiEnabled: checked }))}
              />
            </div>
            <Button onClick={() => handleSaveSettings('integrations')} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações de Integração
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Backup e Manutenção */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Backup e Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="text-admin-blue h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Backup do Banco</h3>
              <p className="text-sm text-gray-500 mb-4">Último backup: hoje às 03:00</p>
              <Button variant="outline" size="sm">
                Fazer Backup Manual
              </Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="text-green-600 h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Teste de APIs</h3>
              <p className="text-sm text-gray-500 mb-4">Verificar conectividade</p>
              <Button variant="outline" size="sm">
                Testar Conexões
              </Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Key className="text-yellow-600 h-8 w-8" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Renovar Tokens</h3>
              <p className="text-sm text-gray-500 mb-4">Atualizar chaves de API</p>
              <Button variant="outline" size="sm">
                Renovar Agora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}