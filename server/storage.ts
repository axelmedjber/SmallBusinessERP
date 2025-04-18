import { 
  User, InsertUser, 
  FinancialData, InsertFinancialData,
  MonthlyData, InsertMonthlyData,
  ExpenseCategory, InsertExpenseCategory,
  Appointment, InsertAppointment
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private financialData: Map<number, FinancialData>;
  private monthlyData: Map<number, MonthlyData>;
  private expenseCategories: Map<number, ExpenseCategory>;
  private appointments: Map<number, Appointment>;
  
  private userIdCounter: number;
  private financialDataIdCounter: number;
  private monthlyDataIdCounter: number;
  private expenseCategoryIdCounter: number;
  private appointmentIdCounter: number;

  constructor() {
    this.users = new Map();
    this.financialData = new Map();
    this.monthlyData = new Map();
    this.expenseCategories = new Map();
    this.appointments = new Map();
    
    this.userIdCounter = 1;
    this.financialDataIdCounter = 1;
    this.monthlyDataIdCounter = 1;
    this.expenseCategoryIdCounter = 1;
    this.appointmentIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Financial Data methods
  async getFinancialData(period: string): Promise<FinancialData | undefined> {
    return Array.from(this.financialData.values()).find(
      (data) => data.period === period
    );
  }
  
  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    const id = this.financialDataIdCounter++;
    const updatedAt = new Date();
    const financialData: FinancialData = { ...data, id, updatedAt };
    this.financialData.set(id, financialData);
    return financialData;
  }
  
  async updateFinancialData(id: number, data: Partial<InsertFinancialData>): Promise<FinancialData | undefined> {
    const existingData = this.financialData.get(id);
    if (!existingData) return undefined;
    
    const updatedData: FinancialData = {
      ...existingData,
      ...data,
      updatedAt: new Date()
    };
    
    this.financialData.set(id, updatedData);
    return updatedData;
  }
  
  // Monthly Data methods
  async getMonthlyData(): Promise<MonthlyData[]> {
    return Array.from(this.monthlyData.values());
  }
  
  async createMonthlyData(data: InsertMonthlyData): Promise<MonthlyData> {
    const id = this.monthlyDataIdCounter++;
    const monthlyData: MonthlyData = { ...data, id };
    this.monthlyData.set(id, monthlyData);
    return monthlyData;
  }
  
  // Expense Categories methods
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return Array.from(this.expenseCategories.values());
  }
  
  async createExpenseCategory(data: InsertExpenseCategory): Promise<ExpenseCategory> {
    const id = this.expenseCategoryIdCounter++;
    const expenseCategory: ExpenseCategory = { ...data, id };
    this.expenseCategories.set(id, expenseCategory);
    return expenseCategory;
  }
  
  async updateExpenseCategory(id: number, data: Partial<InsertExpenseCategory>): Promise<ExpenseCategory | undefined> {
    const existingCategory = this.expenseCategories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: ExpenseCategory = {
      ...existingCategory,
      ...data
    };
    
    this.expenseCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  // Appointments methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async getAppointmentsByMonth(year: number, month: number): Promise<Appointment[]> {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const monthPrefix = `${year}-${monthStr}`;
    
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.date.startsWith(monthPrefix)
    );
  }
  
  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const createdAt = new Date();
    const colorCode = this.getRandomColorCode(id);
    
    const appointment: Appointment = { 
      ...data, 
      id, 
      createdAt,
      colorCode
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointments.get(id);
    if (!existingAppointment) return undefined;
    
    const updatedAppointment: Appointment = {
      ...existingAppointment,
      ...data
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Helper methods
  private getRandomColorCode(id: number): string {
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
    
    return colors[id % colors.length];
  }
  
  // Initialize with sample data
  private initializeSampleData() {
    // Financial data
    this.createFinancialData({
      period: "monthly",
      revenue: 24500,
      revenuePercentChange: 72,
      expenses: 16300,
      expensesPercentChange: 35,
      profit: 8200,
      profitPercentChange: 159,
    });
    
    // Monthly data for charts
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const revenueData = [19500, 20200, 21000, 22500, 21800, 22000, 23000, 24000, 23500, 24000, 24800, 24500];
    const expensesData = [15000, 16000, 15500, 14800, 15200, 15800, 16000, 16500, 15800, 16200, 16000, 16300];
    
    months.forEach((month, idx) => {
      this.createMonthlyData({
        month,
        year: 2023,
        revenue: revenueData[idx],
        expenses: expensesData[idx],
        profit: revenueData[idx] - expensesData[idx]
      });
    });
    
    // Expense categories
    const expenseCategories = [
      { name: 'Payroll', amount: 6500, percentage: 39.9, color: '#f97316' },
      { name: 'Rent', amount: 4000, percentage: 24.5, color: '#facc15' },
      { name: 'Utilities', amount: 1800, percentage: 11.0, color: '#84cc16' },
      { name: 'Marketing', amount: 1200, percentage: 7.4, color: '#14b8a6' },
      { name: 'Supplies', amount: 900, percentage: 5.5, color: '#3b82f6' },
      { name: 'Maintenance', amount: 700, percentage: 4.3, color: '#8b5cf6' },
      { name: 'Insurance', amount: 600, percentage: 3.7, color: '#ec4899' },
      { name: 'Taxes', amount: 600, percentage: 3.7, color: '#ef4444' }
    ];
    
    expenseCategories.forEach(category => {
      this.createExpenseCategory(category);
    });
    
    // Appointments
    const appointments = [
      { title: 'Client Meeting', date: '2023-04-01', time: '10:00', duration: 60, description: 'Discuss new requirements' },
      { title: 'Team Meeting', date: '2023-04-03', time: '14:30', duration: 45, description: 'Weekly standup' },
      { title: 'Supplier Call', date: '2023-04-07', time: '09:00', duration: 30, description: 'Negotiate new contract' },
      { title: 'Financial Review', date: '2023-04-10', time: '13:00', duration: 90, description: 'Quarterly review' },
      { title: 'Tax Meeting', date: '2023-04-15', time: '11:30', duration: 60, description: 'Tax planning' },
      { title: 'Client Onboarding', date: '2023-04-18', time: '15:00', duration: 120, description: 'New client setup' },
      { title: 'Staff Meeting', date: '2023-04-21', time: '10:30', duration: 45, description: 'Team updates' },
      { title: 'Inventory Check', date: '2023-04-24', time: '14:00', duration: 180, description: 'Monthly inventory' },
      { title: 'Sales Meeting', date: '2023-04-28', time: '11:00', duration: 60, description: 'Review sales targets' }
    ];
    
    appointments.forEach(appointment => {
      this.createAppointment(appointment);
    });
  }
}

export const storage = new MemStorage();
