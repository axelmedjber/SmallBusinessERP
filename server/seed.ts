import { db } from './db';
import { 
  users, financialData, monthlyData, expenseCategories, appointments 
} from '@shared/schema';

/**
 * Seed function to initialize the database with sample data
 */
async function seed() {
  console.log("Seeding database with sample data...");
  
  try {
    // Clear existing data (optional)
    await db.delete(appointments);
    await db.delete(expenseCategories);
    await db.delete(monthlyData);
    await db.delete(financialData);
    await db.delete(users);
    
    console.log("Database cleared successfully");
    
    // Add a sample user
    const [user] = await db.insert(users).values({
      username: 'admin',
      password: 'admin123' // In a real application, this would be hashed
    }).returning();
    
    console.log(`Created user: ${user.username}`);
    
    // Add financial data
    const [finData] = await db.insert(financialData).values({
      period: "monthly",
      revenue: 24500,
      revenuePercentChange: 72,
      expenses: 16300,
      expensesPercentChange: 35,
      profit: 8200,
      profitPercentChange: 159,
      updatedAt: new Date()
    }).returning();
    
    console.log(`Created financial data for period: ${finData.period}`);
    
    // Monthly data for charts
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const revenueData = [19500, 20200, 21000, 22500, 21800, 22000, 23000, 24000, 23500, 24000, 24800, 24500];
    const expensesData = [15000, 16000, 15500, 14800, 15200, 15800, 16000, 16500, 15800, 16200, 16000, 16300];
    
    for (let i = 0; i < months.length; i++) {
      await db.insert(monthlyData).values({
        month: months[i],
        year: 2023,
        revenue: revenueData[i],
        expenses: expensesData[i],
        profit: revenueData[i] - expensesData[i]
      });
    }
    
    console.log("Created monthly data for charts");
    
    // Expense categories
    const categoriesList = [
      { name: 'Payroll', amount: 6500, percentage: 399, color: '#f97316' },  // 39.9% as integer (399 = 39.9 * 10)
      { name: 'Rent', amount: 4000, percentage: 245, color: '#facc15' },     // 24.5%
      { name: 'Utilities', amount: 1800, percentage: 110, color: '#84cc16' },// 11.0%
      { name: 'Marketing', amount: 1200, percentage: 74, color: '#14b8a6' }, // 7.4%
      { name: 'Supplies', amount: 900, percentage: 55, color: '#3b82f6' },   // 5.5%
      { name: 'Maintenance', amount: 700, percentage: 43, color: '#8b5cf6' },// 4.3%
      { name: 'Insurance', amount: 600, percentage: 37, color: '#ec4899' },  // 3.7%
      { name: 'Taxes', amount: 600, percentage: 37, color: '#ef4444' }       // 3.7%
    ];
    
    for (const category of categoriesList) {
      await db.insert(expenseCategories).values(category);
    }
    
    console.log("Created expense categories");
    
    // Appointments
    const appointmentsList = [
      { title: 'Client Meeting', date: '2023-04-01', time: '10:00', duration: 60, description: 'Discuss new requirements', colorCode: 'bg-blue-100 text-blue-800', createdAt: new Date() },
      { title: 'Team Meeting', date: '2023-04-03', time: '14:30', duration: 45, description: 'Weekly standup', colorCode: 'bg-green-100 text-green-800', createdAt: new Date() },
      { title: 'Supplier Call', date: '2023-04-07', time: '09:00', duration: 30, description: 'Negotiate new contract', colorCode: 'bg-purple-100 text-purple-800', createdAt: new Date() },
      { title: 'Financial Review', date: '2023-04-10', time: '13:00', duration: 90, description: 'Quarterly review', colorCode: 'bg-yellow-100 text-yellow-800', createdAt: new Date() },
      { title: 'Tax Meeting', date: '2023-04-15', time: '11:30', duration: 60, description: 'Tax planning', colorCode: 'bg-red-100 text-red-800', createdAt: new Date() },
      { title: 'Client Onboarding', date: '2023-04-18', time: '15:00', duration: 120, description: 'New client setup', colorCode: 'bg-indigo-100 text-indigo-800', createdAt: new Date() },
      { title: 'Staff Meeting', date: '2023-04-21', time: '10:30', duration: 45, description: 'Team updates', colorCode: 'bg-pink-100 text-pink-800', createdAt: new Date() },
      { title: 'Inventory Check', date: '2023-04-24', time: '14:00', duration: 180, description: 'Monthly inventory', colorCode: 'bg-teal-100 text-teal-800', createdAt: new Date() },
      { title: 'Sales Meeting', date: '2023-04-28', time: '11:00', duration: 60, description: 'Review sales targets', colorCode: 'bg-blue-100 text-blue-800', createdAt: new Date() }
    ];
    
    for (const appointment of appointmentsList) {
      await db.insert(appointments).values(appointment);
    }
    
    console.log("Created appointments");
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function
seed().then(() => {
  console.log("Seed operation completed");
  process.exit(0);
}).catch(err => {
  console.error("Seed operation failed:", err);
  process.exit(1);
});