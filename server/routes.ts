import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAppointmentSchema, 
  insertCustomerSchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema,
  insertInventoryCategorySchema,
  insertInventoryItemSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Financial data endpoint
  app.get("/api/financial-data", async (req: Request, res: Response) => {
    try {
      const period = req.query.period as string || "monthly";
      const financialData = await storage.getFinancialData(period);
      
      if (!financialData) {
        return res.status(404).json({ message: "Financial data not found" });
      }
      
      const monthlyData = await storage.getMonthlyData();
      
      // Format the response
      const response = {
        revenue: {
          value: financialData.revenue,
          percentChange: financialData.revenuePercentChange,
        },
        expenses: {
          value: financialData.expenses,
          percentChange: financialData.expensesPercentChange,
        },
        profit: {
          value: financialData.profit,
          percentChange: financialData.profitPercentChange,
        },
        revenueByMonth: monthlyData.map(item => ({
          month: item.month,
          revenue: item.revenue,
          expenses: item.expenses,
        })),
        profitByMonth: monthlyData.map(item => ({
          month: item.month,
          profit: item.profit,
        })),
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Refresh financial data endpoint
  app.post("/api/financial-data/refresh", async (req: Request, res: Response) => {
    try {
      const period = req.query.period as string || "monthly";
      const financialData = await storage.getFinancialData(period);
      
      if (!financialData) {
        return res.status(404).json({ message: "Financial data not found" });
      }
      
      // Simulate data refresh by making small changes to the values
      const variationPercent = (Math.random() * 10) - 5; // Random variation between -5% and +5%
      
      const updatedData = await storage.updateFinancialData(financialData.id, {
        revenue: Math.round(financialData.revenue * (1 + variationPercent / 100)),
        expenses: Math.round(financialData.expenses * (1 + variationPercent / 100)),
        profit: Math.round(financialData.profit * (1 + variationPercent / 100)),
      });
      
      return res.status(200).json({ message: "Financial data refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing financial data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Expense categories endpoint
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const expenseCategories = await storage.getExpenseCategories();
      
      if (!expenseCategories || expenseCategories.length === 0) {
        return res.status(404).json({ message: "Expense categories not found" });
      }
      
      return res.status(200).json(expenseCategories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Financial health score endpoint
  app.get("/api/financial-health", async (req: Request, res: Response) => {
    try {
      // Get financial data and other metrics needed for score calculation
      const financialData = await storage.getFinancialData("monthly");
      const monthlyData = await storage.getMonthlyData();
      const inventoryItems = await storage.getInventoryItems();
      const invoices = await storage.getInvoices();
      const lowStockItems = await storage.getLowStockItems();
      
      if (!financialData) {
        return res.status(404).json({ message: "Financial data not found" });
      }
      
      // Calculate financial health metrics
      
      // 1. Profit margin (0-30 points)
      const profitMargin = financialData.profit / financialData.revenue;
      const profitMarginScore = Math.min(30, Math.round(profitMargin * 100));
      
      // 2. Revenue growth (0-20 points)
      let revenueGrowth = 0;
      if (monthlyData.length >= 2) {
        const currentMonth = monthlyData[monthlyData.length - 1].revenue;
        const previousMonth = monthlyData[monthlyData.length - 2].revenue;
        revenueGrowth = (currentMonth - previousMonth) / previousMonth;
      }
      const revenueGrowthScore = Math.min(20, Math.max(0, Math.round(revenueGrowth * 100)));
      
      // 3. Expense management (0-15 points)
      const expenseRatio = financialData.expenses / financialData.revenue;
      const expenseManagementScore = Math.min(15, Math.round(15 * (1 - expenseRatio)));
      
      // 4. Inventory health (0-15 points)
      const inventoryHealth = lowStockItems.length > 0 
        ? 1 - (lowStockItems.length / inventoryItems.length) 
        : 1;
      const inventoryHealthScore = Math.round(15 * inventoryHealth);
      
      // 5. Accounts receivable (0-20 points)
      const overdueInvoices = invoices.filter(inv => inv.status === "overdue").length;
      const arScore = overdueInvoices > 0 
        ? Math.round(20 * (1 - (overdueInvoices / invoices.length)))
        : 20;
      
      // Calculate total score (0-100)
      const totalScore = profitMarginScore + revenueGrowthScore + 
                       expenseManagementScore + inventoryHealthScore + arScore;
      
      // Determine score category and recommendations
      let category = "Poor";
      let recommendations = [];
      
      if (totalScore >= 80) {
        category = "Excellent";
        recommendations = [
          "Consider expansion opportunities", 
          "Invest in growth initiatives",
          "Review pricing strategy for optimization"
        ];
      } else if (totalScore >= 60) {
        category = "Good";
        recommendations = [
          "Focus on increasing profit margins",
          "Look for ways to reduce operational costs",
          "Monitor inventory levels more closely"
        ];
      } else if (totalScore >= 40) {
        category = "Fair";
        recommendations = [
          "Implement stricter expense controls",
          "Address accounts receivable issues",
          "Review pricing and product mix"
        ];
      } else {
        recommendations = [
          "Prioritize cash flow management",
          "Reduce unnecessary expenses immediately",
          "Focus on collecting overdue payments"
        ];
      }
      
      return res.status(200).json({
        score: totalScore,
        category,
        metrics: {
          profitMargin: {
            score: profitMarginScore,
            value: profitMargin,
            maxScore: 30
          },
          revenueGrowth: {
            score: revenueGrowthScore,
            value: revenueGrowth,
            maxScore: 20
          },
          expenseManagement: {
            score: expenseManagementScore,
            value: expenseRatio,
            maxScore: 15
          },
          inventoryHealth: {
            score: inventoryHealthScore,
            value: inventoryHealth,
            maxScore: 15
          },
          accountsReceivable: {
            score: arScore,
            value: overdueInvoices / Math.max(1, invoices.length),
            maxScore: 20
          }
        },
        recommendations
      });
    } catch (error) {
      console.error("Error calculating financial health score:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Appointments endpoints
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      const monthParam = req.query.month as string;
      
      if (monthParam) {
        // Format expected: YYYY-MM
        const [year, month] = monthParam.split("-").map(Number);
        
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
          return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
        }
        
        const appointments = await storage.getAppointmentsByMonth(year, month);
        return res.status(200).json(appointments);
      } else {
        const appointments = await storage.getAppointments();
        return res.status(200).json(appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      const newAppointment = await storage.createAppointment(appointmentData);
      return res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      
      console.error("Error creating appointment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      return res.status(200).json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      
      console.error("Error updating appointment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer endpoints
  app.get("/api/customers", async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string;
      
      if (search) {
        const customers = await storage.searchCustomers(search);
        return res.status(200).json(customers);
      } else {
        const customers = await storage.getCustomers();
        return res.status(200).json(customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customer = await storage.getCustomer(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      return res.status(200).json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/customers", async (req: Request, res: Response) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      const newCustomer = await storage.createCustomer(customerData);
      return res.status(201).json(newCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      
      console.error("Error creating customer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const customerData = insertCustomerSchema.partial().parse(req.body);
      
      const updatedCustomer = await storage.updateCustomer(id, customerData);
      
      if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      return res.status(200).json(updatedCustomer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      
      console.error("Error updating customer:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer ID" });
      }
      
      const success = await storage.deleteCustomer(id);
      
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      
      // Handle specific error for customers with invoices
      if (error instanceof Error && error.message.includes("with existing invoices")) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Invoice endpoints
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string, 10) : undefined;
      
      if (customerId && !isNaN(customerId)) {
        const invoices = await storage.getInvoicesByCustomer(customerId);
        return res.status(200).json(invoices);
      } else {
        const invoices = await storage.getInvoices();
        return res.status(200).json(invoices);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const includeItems = req.query.items === 'true';
      
      if (includeItems) {
        const invoiceWithItems = await storage.getInvoiceWithItems(id);
        return res.status(200).json(invoiceWithItems);
      } else {
        const invoice = await storage.getInvoice(id);
        
        if (!invoice) {
          return res.status(404).json({ message: "Invoice not found" });
        }
        
        return res.status(200).json(invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const { invoice, items } = req.body;
      
      const invoiceData = insertInvoiceSchema.parse(invoice);
      const invoiceItems = z.array(insertInvoiceItemSchema).parse(items || []);
      
      const newInvoice = await storage.createInvoice(invoiceData, invoiceItems);
      return res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      
      console.error("Error creating invoice:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      
      const updatedInvoice = await storage.updateInvoice(id, invoiceData);
      
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      return res.status(200).json(updatedInvoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      
      console.error("Error updating invoice:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/invoices/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Validate status
      const validStatuses = ['draft', 'pending', 'paid', 'overdue', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updatedInvoice = await storage.updateInvoiceStatus(id, status);
      
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      return res.status(200).json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid invoice ID" });
      }
      
      const success = await storage.deleteInvoice(id);
      
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Inventory Category endpoints
  app.get("/api/inventory/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getInventoryCategories();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/inventory/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getInventoryCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      console.error("Error fetching inventory category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/inventory/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertInventoryCategorySchema.parse(req.body);
      
      const newCategory = await storage.createInventoryCategory(categoryData);
      return res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      
      console.error("Error creating inventory category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/inventory/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryData = insertInventoryCategorySchema.partial().parse(req.body);
      
      const updatedCategory = await storage.updateInventoryCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      
      console.error("Error updating inventory category:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/inventory/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteInventoryCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory category:", error);
      
      // Handle specific error for categories with items
      if (error instanceof Error && error.message.includes("with existing items")) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Inventory Item endpoints
  app.get("/api/inventory/items", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const lowStock = req.query.lowStock === 'true';
      
      if (lowStock) {
        const items = await storage.getLowStockItems();
        return res.status(200).json(items);
      } else if (categoryId && !isNaN(categoryId)) {
        const items = await storage.getInventoryItemsByCategory(categoryId);
        return res.status(200).json(items);
      } else {
        const items = await storage.getInventoryItems();
        return res.status(200).json(items);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const item = await storage.getInventoryItem(id);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      return res.status(200).json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/inventory/items", async (req: Request, res: Response) => {
    try {
      const itemData = insertInventoryItemSchema.parse(req.body);
      
      const newItem = await storage.createInventoryItem(itemData);
      return res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      
      console.error("Error creating inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const itemData = insertInventoryItemSchema.partial().parse(req.body);
      
      const updatedItem = await storage.updateInventoryItem(id, itemData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      
      console.error("Error updating inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/inventory/items/:id/stock", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const { quantity } = req.body;
      
      if (quantity === undefined || typeof quantity !== 'number') {
        return res.status(400).json({ message: "Quantity is required and must be a number" });
      }
      
      const updatedItem = await storage.updateInventoryItemStock(id, quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory stock:", error);
      
      // Handle specific error for negative quantity
      if (error instanceof Error && error.message.includes("negative inventory")) {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid item ID" });
      }
      
      const success = await storage.deleteInventoryItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User endpoints
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      return res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const newUser = await storage.createUser(userData);
      return res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userData = insertUserSchema.partial().parse(req.body);
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
