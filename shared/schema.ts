import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Municipalities table
export const municipalities = pgTable("municipalities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  municipalityId: uuid("municipality_id").references(() => municipalities.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // 'root', 'admin', 'gestor', 'user'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// Quotations table
export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  municipalityId: uuid("municipality_id").notNull().references(() => municipalities.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  product: varchar("product", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pendente'), // 'pendente', 'aprovada', 'rejeitada'
  // Campos para análise de preços
  averageMarketPrice: decimal("average_market_price", { precision: 10, scale: 2 }),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }),
  marketAnalysis: text("market_analysis"),
  recommendations: text("recommendations").array(),
  analysisConfidence: decimal("analysis_confidence", { precision: 3, scale: 2 }),
  priceReport: text("price_report"),
  webhookSent: boolean("webhook_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Access logs table
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  municipalityId: uuid("municipality_id").references(() => municipalities.id, { onDelete: 'cascade' }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  ip: varchar("ip", { length: 45 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'sucesso', 'falha'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id").references(() => quotations.id, { onDelete: 'cascade' }),
  municipalityId: uuid("municipality_id").references(() => municipalities.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 100 }).notNull(), // 'nova_cotacao', 'status_atualizado'
  recipient: varchar("recipient", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default('pendente'), // 'enviado', 'pendente', 'falha'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const municipalitiesRelations = relations(municipalities, ({ many }) => ({
  users: many(users),
  quotations: many(quotations),
  accessLogs: many(accessLogs),
  notifications: many(notifications),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [users.municipalityId],
    references: [municipalities.id],
  }),
  quotations: many(quotations),
  accessLogs: many(accessLogs),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  municipality: one(municipalities, {
    fields: [quotations.municipalityId],
    references: [municipalities.id],
  }),
  user: one(users, {
    fields: [quotations.userId],
    references: [users.id],
  }),
  notifications: many(notifications),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
  municipality: one(municipalities, {
    fields: [accessLogs.municipalityId],
    references: [municipalities.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  quotation: one(quotations, {
    fields: [notifications.quotationId],
    references: [quotations.id],
  }),
  municipality: one(municipalities, {
    fields: [notifications.municipalityId],
    references: [municipalities.id],
  }),
}));

// Insert schemas
export const insertMunicipalitySchema = createInsertSchema(municipalities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  timestamp: true,
});

// Types
export type Municipality = typeof municipalities.$inferSelect;
export type InsertMunicipality = z.infer<typeof insertMunicipalitySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;

export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
