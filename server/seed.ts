import { db } from './db';
import { 
  users, financialData, monthlyData, expenseCategories, appointments,
  customers, invoices, invoiceItems, inventoryCategories, inventoryItems
} from '@shared/schema';

/**
 * Seed function to initialize the database with sample data
 */
async function seed() {
  console.log("Seeding database with sample data...");
  
  try {
    // Clear existing data (optional)
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(inventoryItems);
    await db.delete(inventoryCategories);
    await db.delete(customers);
    await db.delete(appointments);
    await db.delete(expenseCategories);
    await db.delete(monthlyData);
    await db.delete(financialData);
    await db.delete(users);
    
    console.log("Database cleared successfully");
    
    // Add sample users with different roles
    const usersList = [
      {
        username: 'admin',
        password: 'admin123', // In a real application, this would be hashed
        email: 'admin@example.com',
        fullName: 'Admin User',
        role: "admin" as const,
        active: true,
        createdAt: new Date()
      },
      {
        username: 'manager',
        password: 'manager123',
        email: 'manager@example.com',
        fullName: 'Manager User',
        role: "manager" as const,
        active: true,
        createdAt: new Date()
      },
      {
        username: 'employee',
        password: 'employee123',
        email: 'employee@example.com',
        fullName: 'Employee User',
        role: "employee" as const,
        active: true,
        createdAt: new Date()
      }
    ];
    
    const createdUsers = await db.insert(users).values(usersList).returning();
    const user = createdUsers[0];
    
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
    
    // Add customers
    const customersList = [
      { 
        name: 'John Smith', 
        company: 'ABC Corporation', 
        email: 'john.smith@abccorp.com', 
        phone: '555-123-4567',
        address: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        notes: 'Key account, prefers email communication',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        name: 'Sarah Johnson', 
        company: 'Johnson Consulting', 
        email: 'sarah@johnsonconsulting.com', 
        phone: '555-987-6543',
        address: '456 Consulting Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        notes: 'New client, referred by ABC Corp',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { 
        name: 'David Chen', 
        company: 'Tech Innovations', 
        email: 'david@techinnovations.com', 
        phone: '555-456-7890',
        address: '789 Technology Park',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        notes: 'Tech startup, growing quickly',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const customerIds = [];
    for (const customer of customersList) {
      const [newCustomer] = await db.insert(customers).values(customer).returning();
      customerIds.push(newCustomer.id);
    }
    
    console.log("Created customers");
    
    // Add inventory categories
    const inventoryCategoriesList = [
      { name: 'Office Supplies', description: 'Paper, pens, staplers, and other office essentials' },
      { name: 'Electronics', description: 'Computers, phones, and other electronic devices' },
      { name: 'Furniture', description: 'Desks, chairs, and other office furniture' }
    ];
    
    const categoryIds = [];
    for (const category of inventoryCategoriesList) {
      const [newCategory] = await db.insert(inventoryCategories).values(category).returning();
      categoryIds.push(newCategory.id);
    }
    
    console.log("Created inventory categories");
    
    // Add inventory items
    const now = new Date();
    const inventoryItemsList = [
      { 
        categoryId: categoryIds[0], 
        name: 'Copy Paper (500 sheets)', 
        description: 'Standard 8.5x11 white copy paper, 500 sheets per ream',
        sku: 'PAPER-001',
        quantityInStock: 120,
        reorderLevel: 20,
        unitPrice: 4.99,
        costPrice: 3.50,
        createdAt: now,
        updatedAt: now
      },
      { 
        categoryId: categoryIds[0], 
        name: 'Ballpoint Pens (Box of 12)', 
        description: 'Medium point blue ballpoint pens, box of 12',
        sku: 'PEN-002',
        quantityInStock: 25,
        reorderLevel: 10,
        unitPrice: 3.99,
        costPrice: 2.25,
        createdAt: now,
        updatedAt: now
      },
      { 
        categoryId: categoryIds[1], 
        name: 'Wireless Mouse', 
        description: 'Ergonomic wireless mouse with USB receiver',
        sku: 'ELEC-001',
        quantityInStock: 15,
        reorderLevel: 5,
        unitPrice: 24.99,
        costPrice: 18.50,
        createdAt: now,
        updatedAt: now
      },
      { 
        categoryId: categoryIds[1], 
        name: 'USB Flash Drive 64GB', 
        description: 'USB 3.0 flash drive with 64GB storage capacity',
        sku: 'ELEC-002',
        quantityInStock: 8,
        reorderLevel: 10,
        unitPrice: 19.99,
        costPrice: 14.75,
        createdAt: now,
        updatedAt: now
      },
      { 
        categoryId: categoryIds[2], 
        name: 'Office Chair', 
        description: 'Adjustable ergonomic office chair with lumbar support',
        sku: 'FURN-001',
        quantityInStock: 7,
        reorderLevel: 3,
        unitPrice: 199.99,
        costPrice: 149.50,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    for (const item of inventoryItemsList) {
      await db.insert(inventoryItems).values({
        ...item,
        // Ensure numeric values are properly typed as strings for Drizzle
        unitPrice: String(item.unitPrice),
        costPrice: String(item.costPrice),
        quantityInStock: String(item.quantityInStock),
        reorderLevel: String(item.reorderLevel)
      });
    }
    
    console.log("Created inventory items");
    
    // Create invoices
    const invoicesList = [
      {
        customerId: customerIds[0],
        invoiceNumber: 'INV-2023-001',
        status: 'paid',
        issueDate: new Date('2023-01-15'),
        dueDate: new Date('2023-02-15'),
        subtotal: 299.97,
        taxRate: 8.5,
        taxAmount: 25.50,
        totalAmount: 325.47,
        notes: 'Paid via bank transfer',
        createdAt: now,
        updatedAt: now
      },
      {
        customerId: customerIds[1],
        invoiceNumber: 'INV-2023-002',
        status: 'pending',
        issueDate: new Date('2023-02-20'),
        dueDate: new Date('2023-03-20'),
        subtotal: 499.95,
        taxRate: 8.5,
        taxAmount: 42.50,
        totalAmount: 542.45,
        notes: 'Net 30 payment terms',
        createdAt: now,
        updatedAt: now
      },
      {
        customerId: customerIds[2],
        invoiceNumber: 'INV-2023-003',
        status: 'draft',
        issueDate: new Date('2023-03-05'),
        dueDate: new Date('2023-04-05'),
        subtotal: 899.94,
        taxRate: 8.5,
        taxAmount: 76.49,
        totalAmount: 976.43,
        notes: 'Draft invoice for review',
        createdAt: now,
        updatedAt: now
      }
    ];
    
    const invoiceIds = [];
    for (const invoice of invoicesList) {
      const [newInvoice] = await db.insert(invoices).values({
        ...invoice,
        // Convert numeric values to strings for Drizzle
        subtotal: String(invoice.subtotal),
        taxRate: String(invoice.taxRate),
        taxAmount: String(invoice.taxAmount),
        totalAmount: String(invoice.totalAmount),
        // Convert dates to ISO strings
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString()
      }).returning();
      invoiceIds.push(newInvoice.id);
    }
    
    console.log("Created invoices");
    
    // Create invoice items
    const invoiceItemsList = [
      {
        invoiceId: invoiceIds[0],
        description: 'Copy Paper (500 sheets) - 10 reams',
        quantity: 10,
        unitPrice: 4.99,
        amount: 49.90
      },
      {
        invoiceId: invoiceIds[0],
        description: 'USB Flash Drive 64GB - 5 units',
        quantity: 5,
        unitPrice: 19.99,
        amount: 99.95
      },
      {
        invoiceId: invoiceIds[0],
        description: 'Wireless Mouse - 5 units',
        quantity: 5,
        unitPrice: 24.99,
        amount: 124.95
      },
      {
        invoiceId: invoiceIds[1],
        description: 'Office Chair - 2 units',
        quantity: 2,
        unitPrice: 199.99,
        amount: 399.98
      },
      {
        invoiceId: invoiceIds[1],
        description: 'Ballpoint Pens (Box of 12) - 5 boxes',
        quantity: 5,
        unitPrice: 3.99,
        amount: 19.95
      },
      {
        invoiceId: invoiceIds[2],
        description: 'Office Chair - 4 units',
        quantity: 4,
        unitPrice: 199.99,
        amount: 799.96
      },
      {
        invoiceId: invoiceIds[2],
        description: 'USB Flash Drive 64GB - 5 units',
        quantity: 5,
        unitPrice: 19.99,
        amount: 99.95
      }
    ];
    
    for (const item of invoiceItemsList) {
      await db.insert(invoiceItems).values({
        ...item,
        // Convert numeric values to strings for Drizzle
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
        amount: String(item.amount)
      });
    }
    
    console.log("Created invoice items");
    
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