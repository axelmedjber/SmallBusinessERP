import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table (kept from original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
