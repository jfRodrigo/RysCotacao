import { 
  municipalities, 
  users, 
  quotations, 
  accessLogs, 
  notifications,
  type Municipality, 
  type InsertMunicipality,
  type User, 
  type InsertUser,
  type Quotation,
  type InsertQuotation,
  type AccessLog,
  type InsertAccessLog,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Municipality operations
  createMunicipality(municipality: InsertMunicipality): Promise<Municipality>;
  getMunicipalities(): Promise<Municipality[]>;
  getMunicipalityById(id: string): Promise<Municipality | undefined>;
  updateMunicipality(id: string, municipality: Partial<InsertMunicipality>): Promise<Municipality | undefined>;
  deleteMunicipality(id: string): Promise<boolean>;

  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUsers(municipalityId?: string): Promise<User[]>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;

  // Quotation operations
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  getQuotations(municipalityId?: string): Promise<Quotation[]>;
  getQuotationById(id: string): Promise<Quotation | undefined>;
  updateQuotation(id: string, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: string): Promise<boolean>;

  // Access log operations
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(municipalityId?: string): Promise<AccessLog[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(municipalityId?: string): Promise<Notification[]>;
}

export class DatabaseStorage implements IStorage {
  // Municipality operations
  async createMunicipality(municipality: InsertMunicipality): Promise<Municipality> {
    const [result] = await db.insert(municipalities).values(municipality).returning();
    return result;
  }

  async getMunicipalities(): Promise<Municipality[]> {
    return await db.select().from(municipalities).orderBy(desc(municipalities.createdAt));
  }

  async getMunicipalityById(id: string): Promise<Municipality | undefined> {
    const [result] = await db.select().from(municipalities).where(eq(municipalities.id, id));
    return result;
  }

  async updateMunicipality(id: string, municipality: Partial<InsertMunicipality>): Promise<Municipality | undefined> {
    const [result] = await db.update(municipalities)
      .set(municipality)
      .where(eq(municipalities.id, id))
      .returning();
    return result;
  }

  async deleteMunicipality(id: string): Promise<boolean> {
    const result = await db.delete(municipalities).where(eq(municipalities.id, id));
    return result.rowCount > 0;
  }

  // User operations
  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const [result] = await db.insert(users).values({
      ...user,
      password: hashedPassword,
    }).returning();
    return result;
  }

  async getUsers(municipalityId?: string): Promise<User[]> {
    if (municipalityId) {
      return await db.select().from(users)
        .where(eq(users.municipalityId, municipalityId))
        .orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const updateData = { ...user };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    const [result] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  // Quotation operations
  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [result] = await db.insert(quotations).values(quotation).returning();
    return result;
  }

  async getQuotations(municipalityId?: string): Promise<Quotation[]> {
    if (municipalityId) {
      return await db.select().from(quotations)
        .where(eq(quotations.municipalityId, municipalityId))
        .orderBy(desc(quotations.createdAt));
    }
    return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotationById(id: string): Promise<Quotation | undefined> {
    const [result] = await db.select().from(quotations).where(eq(quotations.id, id));
    return result;
  }

  async updateQuotation(id: string, quotation: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [result] = await db.update(quotations)
      .set(quotation)
      .where(eq(quotations.id, id))
      .returning();
    return result;
  }

  async deleteQuotation(id: string): Promise<boolean> {
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return result.rowCount > 0;
  }

  // Access log operations
  async createAccessLog(log: InsertAccessLog): Promise<AccessLog> {
    const [result] = await db.insert(accessLogs).values(log).returning();
    return result;
  }

  async getAccessLogs(municipalityId?: string): Promise<AccessLog[]> {
    if (municipalityId) {
      return await db.select().from(accessLogs)
        .where(eq(accessLogs.municipalityId, municipalityId))
        .orderBy(desc(accessLogs.timestamp));
    }
    return await db.select().from(accessLogs).orderBy(desc(accessLogs.timestamp));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await db.insert(notifications).values(notification).returning();
    return result;
  }

  async getNotifications(municipalityId?: string): Promise<Notification[]> {
    if (municipalityId) {
      return await db.select().from(notifications)
        .where(eq(notifications.municipalityId, municipalityId))
        .orderBy(desc(notifications.timestamp));
    }
    return await db.select().from(notifications).orderBy(desc(notifications.timestamp));
  }
}

export const storage = new DatabaseStorage();
