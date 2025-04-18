import { db } from './db';
import { 
  User, InsertUser, 
  FinancialData, InsertFinancialData,
  MonthlyData, InsertMonthlyData,
  ExpenseCategory, InsertExpenseCategory,
  Appointment, InsertAppointment,
  users, financialData, monthlyData, expenseCategories, appointments
} from "@shared/schema";
import { eq, and, like } from 'drizzle-orm';

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Financial Data
  getFinancialData(period: string): Promise<FinancialData | undefined>;
  createFinancialData(data: InsertFinancialData): Promise<FinancialData>;
  updateFinancialData(id: number, data: Partial<InsertFinancialData>): Promise<FinancialData | undefined>;
  
  // Monthly Data
  getMonthlyData(): Promise<MonthlyData[]>;
  createMonthlyData(data: InsertMonthlyData): Promise<MonthlyData>;
  
  // Expense Categories
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  createExpenseCategory(data: InsertExpenseCategory): Promise<ExpenseCategory>;
  updateExpenseCategory(id: number, data: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByMonth(year: number, month: number): Promise<Appointment[]>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Financial Data methods
  async getFinancialData(period: string): Promise<FinancialData | undefined> {
    const [data] = await db.select().from(financialData).where(eq(financialData.period, period));
    return data;
  }

  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    const [newData] = await db.insert(financialData).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return newData;
  }

  async updateFinancialData(id: number, data: Partial<InsertFinancialData>): Promise<FinancialData | undefined> {
    const [updatedData] = await db.update(financialData)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(financialData.id, id))
      .returning();
    return updatedData;
  }

  // Monthly Data methods
  async getMonthlyData(): Promise<MonthlyData[]> {
    return await db.select().from(monthlyData);
  }

  async createMonthlyData(data: InsertMonthlyData): Promise<MonthlyData> {
    const [newData] = await db.insert(monthlyData).values(data).returning();
    return newData;
  }

  // Expense Categories methods
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories);
  }

  async createExpenseCategory(data: InsertExpenseCategory): Promise<ExpenseCategory> {
    // Ensure color is not undefined
    const categoryData = {
      ...data,
      color: data.color || null,
    };
    
    const [newCategory] = await db.insert(expenseCategories).values(categoryData).returning();
    return newCategory;
  }

  async updateExpenseCategory(id: number, data: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const [updatedCategory] = await db.update(expenseCategories)
      .set(data)
      .where(eq(expenseCategories.id, id))
      .returning();
    return updatedCategory;
  }

  // Appointments methods
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointmentsByMonth(year: number, month: number): Promise<Appointment[]> {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const monthPrefix = `${year}-${monthStr}`;
    
    return await db.select().from(appointments)
      .where(like(appointments.date, `${monthPrefix}%`));
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    // Ensure description is not undefined
    const appointmentData = {
      ...data,
      createdAt: new Date(),
      colorCode: this.getRandomColorCode(),
      description: data.description || null,
    };
    
    const [newAppointment] = await db.insert(appointments).values(appointmentData).returning();
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db.update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  // Helper method for generating color codes
  private getRandomColorCode(): string {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800'
    ];
    
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}

// Initialize with the database storage
export const storage = new DatabaseStorage();