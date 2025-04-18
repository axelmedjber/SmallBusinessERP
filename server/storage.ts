import { db } from './db';
import { 
  User, InsertUser, 
  FinancialData, InsertFinancialData,
  MonthlyData, InsertMonthlyData,
  ExpenseCategory, InsertExpenseCategory,
  Appointment, InsertAppointment,
  Customer, InsertCustomer,
  Invoice, InsertInvoice,
  InvoiceItem, InsertInvoiceItem,
  InventoryCategory, InsertInventoryCategory,
  InventoryItem, InsertInventoryItem,
  users, financialData, monthlyData, expenseCategories, appointments,
  customers, invoices, invoiceItems, inventoryCategories, inventoryItems
} from "@shared/schema";
import { eq, and, like, desc, asc, sql, or } from 'drizzle-orm';

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  
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
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  searchCustomers(query: string): Promise<Customer[]>;
  createCustomer(data: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCustomer(customerId: number): Promise<Invoice[]>;
  getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]}>;
  createInvoice(data: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Invoice Items
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, data: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;
  
  // Inventory Categories
  getInventoryCategories(): Promise<InventoryCategory[]>;
  getInventoryCategory(id: number): Promise<InventoryCategory | undefined>;
  createInventoryCategory(data: InsertInventoryCategory): Promise<InventoryCategory>;
  updateInventoryCategory(id: number, data: Partial<InsertInventoryCategory>): Promise<InventoryCategory | undefined>;
  deleteInventoryCategory(id: number): Promise<boolean>;
  
  // Inventory Items
  getInventoryItems(): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  getInventoryItemsByCategory(categoryId: number): Promise<InventoryItem[]>;
  getLowStockItems(): Promise<InventoryItem[]>;
  createInventoryItem(data: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, data: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  updateInventoryItemStock(id: number, quantity: number): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
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

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date()
    }).returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
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
  
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  
  async searchCustomers(query: string): Promise<Customer[]> {
    const searchQuery = `%${query}%`;
    return await db.select().from(customers)
      .where(
        or(
          like(customers.name, searchQuery),
          like(customers.company, searchQuery),
          like(customers.email, searchQuery),
          like(customers.phone, searchQuery)
        )
      )
      .orderBy(customers.name);
  }
  
  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const now = new Date();
    const [customer] = await db.insert(customers).values({
      ...data,
      createdAt: now,
      updatedAt: now
    }).returning();
    return customer;
  }
  
  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    // First check if there are any invoices for this customer
    const invoiceCount = await db.select({ count: sql`count(*)` })
      .from(invoices)
      .where(eq(invoices.customerId, id));
      
    if (Number(invoiceCount[0].count) > 0) {
      throw new Error('Cannot delete customer with existing invoices');
    }
    
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }
  
  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return await db.select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async getInvoicesByCustomer(customerId: number): Promise<Invoice[]> {
    return await db.select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }
  
  async getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]}> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    
    return {
      invoice,
      items
    };
  }
  
  async createInvoice(data: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const now = new Date();
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the invoice
      const [invoice] = await tx.insert(invoices).values({
        ...data,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      // Insert all invoice items
      if (items && items.length > 0) {
        const invoiceItemsWithId = items.map(item => ({
          ...item,
          invoiceId: invoice.id
        }));
        
        await tx.insert(invoiceItems).values(invoiceItemsWithId);
      }
      
      return invoice;
    });
  }
  
  async updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }
  
  async updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined> {
    // Convert string to enum type
    const [invoice] = await db.update(invoices)
      .set({
        status: status as any, // Type assertion to bypass type checking
        updatedAt: new Date()
      })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      // Delete related invoice items first
      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
      
      // Delete the invoice
      const result = await tx.delete(invoices).where(eq(invoices.id, id)).returning();
      return result.length > 0;
    });
  }
  
  // Invoice Items
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
  
  async createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db.insert(invoiceItems).values(data).returning();
    return item;
  }
  
  async updateInvoiceItem(id: number, data: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [item] = await db.update(invoiceItems)
      .set(data)
      .where(eq(invoiceItems.id, id))
      .returning();
    return item;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id)).returning();
    return result.length > 0;
  }
  
  // Inventory Category methods
  async getInventoryCategories(): Promise<InventoryCategory[]> {
    return await db.select().from(inventoryCategories).orderBy(inventoryCategories.name);
  }
  
  async getInventoryCategory(id: number): Promise<InventoryCategory | undefined> {
    const [category] = await db.select().from(inventoryCategories).where(eq(inventoryCategories.id, id));
    return category;
  }
  
  async createInventoryCategory(data: InsertInventoryCategory): Promise<InventoryCategory> {
    const [category] = await db.insert(inventoryCategories).values(data).returning();
    return category;
  }
  
  async updateInventoryCategory(id: number, data: Partial<InsertInventoryCategory>): Promise<InventoryCategory | undefined> {
    const [category] = await db.update(inventoryCategories)
      .set(data)
      .where(eq(inventoryCategories.id, id))
      .returning();
    return category;
  }
  
  async deleteInventoryCategory(id: number): Promise<boolean> {
    // First check if there are any items in this category
    const itemCount = await db.select({ count: sql`count(*)` })
      .from(inventoryItems)
      .where(eq(inventoryItems.categoryId, id));
      
    if (Number(itemCount[0].count) > 0) {
      throw new Error('Cannot delete category with existing items');
    }
    
    const result = await db.delete(inventoryCategories).where(eq(inventoryCategories.id, id)).returning();
    return result.length > 0;
  }
  
  // Inventory Item methods
  async getInventoryItems(): Promise<InventoryItem[]> {
    return await db.select().from(inventoryItems).orderBy(inventoryItems.name);
  }
  
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }
  
  async getInventoryItemsByCategory(categoryId: number): Promise<InventoryItem[]> {
    return await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.categoryId, categoryId))
      .orderBy(inventoryItems.name);
  }
  
  async getLowStockItems(): Promise<InventoryItem[]> {
    return await db.select()
      .from(inventoryItems)
      .where(
        sql`${inventoryItems.quantityInStock} <= ${inventoryItems.reorderLevel}`
      )
      .orderBy(asc(inventoryItems.quantityInStock));
  }
  
  async createInventoryItem(data: InsertInventoryItem): Promise<InventoryItem> {
    const now = new Date();
    const [item] = await db.insert(inventoryItems).values({
      ...data,
      createdAt: now,
      updatedAt: now
    }).returning();
    return item;
  }
  
  async updateInventoryItem(id: number, data: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [item] = await db.update(inventoryItems)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(inventoryItems.id, id))
      .returning();
    return item;
  }
  
  async updateInventoryItemStock(id: number, quantity: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    
    if (!item) {
      return undefined;
    }
    
    const newQuantity = item.quantityInStock + quantity;
    
    if (newQuantity < 0) {
      throw new Error('Cannot have negative inventory quantity');
    }
    
    const [updatedItem] = await db.update(inventoryItems)
      .set({
        quantityInStock: newQuantity,
        updatedAt: new Date()
      })
      .where(eq(inventoryItems.id, id))
      .returning();
      
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();
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