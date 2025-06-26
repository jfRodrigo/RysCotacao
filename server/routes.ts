import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { z } from "zod";
import { insertMunicipalitySchema, insertUserSchema, insertQuotationSchema } from "@shared/schema";
import { analyzePrices, generateQuotationReport } from "./openai";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8neditor.rs-cotacaodeopreco.online/webhook/8Hp0zOw28fPumRYp";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    municipalityId?: string;
  };
}

// Middleware to authenticate JWT token
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      municipalityId: user.municipalityId || undefined,
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Middleware to check if user is root
const requireRoot = (req: AuthenticatedRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'root') {
    return res.status(403).json({ message: 'Acesso negado. Apenas usuários ROOT.' });
  }
  next();
};

// Middleware to log access
const logAccess = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const originalJson = res.json;
  res.json = function(body) {
    // Log the access after response
    if (req.user) {
      storage.createAccessLog({
        userId: req.user.id,
        municipalityId: req.user.municipalityId || null,
        endpoint: req.path,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        status: res.statusCode >= 400 ? 'falha' : 'sucesso',
      });
    }
    return originalJson.call(this, body);
  };
  next();
};

// Send webhook to n8n
const sendWebhook = async (payload: any) => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.N8N_API_KEY || 'default-key',
      },
      body: JSON.stringify(payload),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply logging middleware to all API routes
  app.use('/api', logAccess);

  // Authentication routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      await storage.updateLastLogin(user.id);

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          municipalityId: user.municipalityId 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          municipalityId: user.municipalityId,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/register', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Only root can create users without municipalityId, or admin can create users for their municipality
      if (req.user?.role === 'root') {
        // Root can create any user
      } else if (req.user?.role === 'admin' && req.user.municipalityId) {
        // Admin can only create users for their municipality
        userData.municipalityId = req.user.municipalityId;
      } else {
        return res.status(403).json({ message: 'Não autorizado a criar usuários' });
      }

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Municipality routes (ROOT only)
  app.get('/api/municipalities', authenticateToken, requireRoot, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const municipalities = await storage.getMunicipalities();
      res.json(municipalities);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar municípios' });
    }
  });

  app.post('/api/municipalities', authenticateToken, requireRoot, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const municipalityData = insertMunicipalitySchema.parse(req.body);
      const municipality = await storage.createMunicipality(municipalityData);
      res.status(201).json(municipality);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro ao criar município' });
    }
  });

  app.patch('/api/municipalities/:id', authenticateToken, requireRoot, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const municipalityData = insertMunicipalitySchema.partial().parse(req.body);
      const municipality = await storage.updateMunicipality(id, municipalityData);
      
      if (!municipality) {
        return res.status(404).json({ message: 'Município não encontrado' });
      }
      
      res.json(municipality);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro ao atualizar município' });
    }
  });

  app.delete('/api/municipalities/:id', authenticateToken, requireRoot, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMunicipality(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Município não encontrado' });
      }
      
      res.json({ message: 'Município removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover município' });
    }
  });

  // User routes
  app.get('/api/users', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let users;
      
      if (req.user?.role === 'root') {
        users = await storage.getUsers();
      } else if (req.user?.municipalityId) {
        users = await storage.getUsers(req.user.municipalityId);
      } else {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
  });

  app.patch('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userData = insertUserSchema.partial().parse(req.body);
      
      // Check permissions
      const targetUser = await storage.getUserById(id);
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      if (req.user?.role !== 'root' && 
          req.user?.municipalityId !== targetUser.municipalityId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro ao atualizar usuário' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check permissions
      const targetUser = await storage.getUserById(id);
      if (!targetUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      if (req.user?.role !== 'root' && 
          req.user?.municipalityId !== targetUser.municipalityId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      res.json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover usuário' });
    }
  });

  // Quotation routes
  app.get('/api/quotations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let quotations;
      
      if (req.user?.role === 'root') {
        quotations = await storage.getQuotations();
      } else if (req.user?.municipalityId) {
        quotations = await storage.getQuotations(req.user.municipalityId);
      } else {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      res.json(quotations);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar cotações' });
    }
  });

  app.post('/api/quotations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.municipalityId) {
        return res.status(403).json({ message: 'Apenas usuários municipais podem criar cotações' });
      }
      
      const quotationData = insertQuotationSchema.parse(req.body);
      
      // Ensure the quotation belongs to the user's municipality
      quotationData.municipalityId = req.user.municipalityId;
      quotationData.userId = req.user.id;
      
      console.log('Iniciando análise de preços para:', quotationData.product);
      
      // Realizar análise de preços com OpenAI
      const priceAnalysis = await analyzePrices(
        quotationData.product,
        quotationData.quantity,
        parseFloat(quotationData.unitPrice.toString())
      );
      
      // Buscar dados do município para o relatório
      const municipality = await storage.getMunicipalityById(req.user.municipalityId);
      
      // Gerar relatório completo
      const report = await generateQuotationReport(
        quotationData.product,
        quotationData.quantity,
        parseFloat(quotationData.unitPrice.toString()),
        priceAnalysis,
        municipality?.name || 'Município'
      );
      
      // Adicionar dados da análise à cotação
      const enrichedQuotationData = {
        ...quotationData,
        averageMarketPrice: priceAnalysis.averagePrice.toString(),
        priceRangeMin: priceAnalysis.priceRange.min.toString(),
        priceRangeMax: priceAnalysis.priceRange.max.toString(),
        marketAnalysis: priceAnalysis.marketAnalysis,
        recommendations: priceAnalysis.recommendations,
        analysisConfidence: priceAnalysis.confidence.toString(),
        priceReport: report,
      };
      
      const quotation = await storage.createQuotation(enrichedQuotationData);
      
      // Send webhook to n8n with analysis data
      const webhookPayload = {
        cotacao_id: quotation.id,
        cliente_id: quotation.municipalityId,
        usuario_id: quotation.userId,
        produto: quotation.product,
        quantidade: quotation.quantity,
        preco_unitario: quotation.unitPrice,
        preco_total: quotation.totalPrice,
        preco_medio_mercado: priceAnalysis.averagePrice,
        faixa_preco_min: priceAnalysis.priceRange.min,
        faixa_preco_max: priceAnalysis.priceRange.max,
        analise_mercado: priceAnalysis.marketAnalysis,
        recomendacoes: priceAnalysis.recommendations,
        confianca_analise: priceAnalysis.confidence,
        status: quotation.status,
        timestamp: quotation.createdAt,
      };
      
      const webhookSent = await sendWebhook(webhookPayload);
      
      // Update webhook status
      if (webhookSent) {
        await storage.updateQuotation(quotation.id, { webhookSent: true });
      }
      
      // Create notification
      await storage.createNotification({
        quotationId: quotation.id,
        municipalityId: quotation.municipalityId,
        type: 'nova_cotacao',
        recipient: req.user.email,
        status: webhookSent ? 'enviado' : 'falha',
      });
      
      console.log('Cotação criada com análise completa:', quotation.id);
      
      res.status(201).json(quotation);
    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro ao criar cotação' });
    }
  });

  app.patch('/api/quotations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const quotationData = insertQuotationSchema.partial().parse(req.body);
      
      // Check permissions
      const existingQuotation = await storage.getQuotationById(id);
      if (!existingQuotation) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }
      
      if (req.user?.role !== 'root' && 
          req.user?.municipalityId !== existingQuotation.municipalityId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const quotation = await storage.updateQuotation(id, quotationData);
      if (!quotation) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }
      
      // Send webhook if status changed
      if (quotationData.status && quotationData.status !== existingQuotation.status) {
        const webhookPayload = {
          cotacao_id: quotation.id,
          cliente_id: quotation.municipalityId,
          usuario_id: quotation.userId,
          produto: quotation.product,
          quantidade: quotation.quantity,
          preco_total: quotation.totalPrice,
          status: quotation.status,
          timestamp: new Date(),
        };
        
        const webhookSent = await sendWebhook(webhookPayload);
        
        // Create notification
        await storage.createNotification({
          quotationId: quotation.id,
          municipalityId: quotation.municipalityId,
          type: 'status_atualizado',
          recipient: req.user?.email || '',
          status: webhookSent ? 'enviado' : 'falha',
        });
      }
      
      res.json(quotation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro ao atualizar cotação' });
    }
  });

  app.delete('/api/quotations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check permissions
      const quotation = await storage.getQuotationById(id);
      if (!quotation) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }
      
      if (req.user?.role !== 'root' && 
          req.user?.municipalityId !== quotation.municipalityId &&
          req.user?.id !== quotation.userId) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      const deleted = await storage.deleteQuotation(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Cotação não encontrada' });
      }
      
      res.json({ message: 'Cotação removida com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao remover cotação' });
    }
  });

  // Access logs route
  app.get('/api/access-logs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let logs;
      
      if (req.user?.role === 'root') {
        logs = await storage.getAccessLogs();
      } else if (req.user?.municipalityId) {
        logs = await storage.getAccessLogs(req.user.municipalityId);
      } else {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar logs de acesso' });
    }
  });

  // Notifications route
  app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      let notifications;
      
      if (req.user?.role === 'root') {
        notifications = await storage.getNotifications();
      } else if (req.user?.municipalityId) {
        notifications = await storage.getNotifications(req.user.municipalityId);
      } else {
        return res.status(403).json({ message: 'Acesso negado' });
      }
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar notificações' });
    }
  });

  // Webhook endpoint for n8n
  app.post('/api/webhook/cotacao', async (req: Request, res: Response) => {
    try {
      // Process webhook from n8n if needed
      console.log('Webhook received:', req.body);
      res.json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao processar webhook' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
