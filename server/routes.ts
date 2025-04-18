import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
