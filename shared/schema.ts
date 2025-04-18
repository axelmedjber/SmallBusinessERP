import { pgTable, text, serial, integer, timestamp, varchar, boolean, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Role enum for user roles
export const roleEnum = pgEnum('role', ['admin', 'manager', 'employee']);

// User table with role
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: roleEnum("role").default("employee").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Financial data table
export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(),
  period: varchar("period", { length: 20 }).notNull(), // monthly, quarterly, yearly
  revenue: integer("revenue").notNull(),
  revenuePercentChange: integer("revenue_percent_change").notNull(),
  expenses: integer("expenses").notNull(),
  expensesPercentChange: integer("expenses_percent_change").notNull(),
  profit: integer("profit").notNull(),
  profitPercentChange: integer("profit_percent_change").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFinancialDataSchema = createInsertSchema(financialData).omit({
  id: true,
  updatedAt: true,
});

// Monthly financial data for charts
export const monthlyData = pgTable("monthly_data", {
  id: serial("id").primaryKey(),
  month: varchar("month", { length: 10 }).notNull(),
  year: integer("year").notNull(),
  revenue: integer("revenue").notNull(),
  expenses: integer("expenses").notNull(),
  profit: integer("profit").notNull(),
});

export const insertMonthlyDataSchema = createInsertSchema(monthlyData).omit({
  id: true,
});

// Expense categories
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  percentage: integer("percentage").notNull(),
  color: varchar("color", { length: 20 }),
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({
  id: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar("time", { length: 5 }).notNull(), // HH:MM
  duration: integer("duration").notNull(), // Minutes
  description: text("description"),
  colorCode: varchar("color_code", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  colorCode: true,
  createdAt: true,
});

// Customer table for CRM
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  company: varchar("company", { length: 100 }),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 50 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 50 }),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Customer relations
export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

// Invoice status enum
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'pending', 'paid', 'overdue', 'cancelled']);

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  invoiceNumber: varchar("invoice_number", { length: 20 }).notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Invoice relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
}));

// Invoice items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id),
  description: varchar("description", { length: 200 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

// Invoice item relations
export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

// Inventory categories
export const inventoryCategories = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
});

export const insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({
  id: true,
});

// Inventory items
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => inventoryCategories.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 30 }),
  quantityInStock: integer("quantity_in_stock").default(0).notNull(),
  reorderLevel: integer("reorder_level").default(10),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inventory relations
export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  category: one(inventoryCategories, {
    fields: [inventoryItems.categoryId],
    references: [inventoryCategories.id],
  }),
}));

// Types exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FinancialData = typeof financialData.$inferSelect;
export type InsertFinancialData = z.infer<typeof insertFinancialDataSchema>;

export type MonthlyData = typeof monthlyData.$inferSelect;
export type InsertMonthlyData = z.infer<typeof insertMonthlyDataSchema>;

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type InventoryCategory = typeof inventoryCategories.$inferSelect;
export type InsertInventoryCategory = z.infer<typeof insertInventoryCategorySchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
