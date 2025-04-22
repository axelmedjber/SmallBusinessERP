# Small Business ERP System

A comprehensive Enterprise Resource Planning (ERP) system designed specifically for small businesses. This application provides real-time insights through interactive dashboards, financial management, expense tracking, inventory management, and customer relationship management tools.

![Small Business ERP Dashboard](/attached_assets/small_business_erp.png)

## Features

- **Dashboard Analytics**: Real-time overview of business performance with key metrics
- **Financial Management**: Track revenue, expenses, and profit with detailed analysis
- **Inventory Management**: Monitor stock levels, product categories, and reorder alerts
- **Customer Management**: Manage customer information and track interactions
- **Invoice Generation**: Create, manage, and track invoices with status updates
- **Appointment Calendar**: Schedule and manage business appointments
- **User Management**: Role-based access control (Admin, Manager, Employee)
- **Multilingual Support**: Available in English, French, and Arabic with RTL support

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Recharts for data visualization
- React Hook Form with Zod validation
- TanStack Query for API data fetching
- Wouter for client-side routing
- Date-fns for date formatting

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- RESTful API architecture

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React context providers
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and types
│   │   ├── pages/      # Application pages/routes
│   │   └── App.tsx     # Main application component
├── server/             # Backend Express server
│   ├── db.ts           # Database connection setup
│   ├── routes.ts       # API route definitions
│   ├── storage.ts      # Data storage interface
│   └── auth.ts         # Authentication setup
└── shared/             # Shared code between client and server
    └── schema.ts       # Database schema definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/axelmedjber/SmallBusinessERP.git
   cd SmallBusinessERP
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a PostgreSQL database and update the connection string in your environment variables.

4. Run database migrations:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/erp_database
SESSION_SECRET=your_session_secret
```

## Role-Based Access

- **Admin**: Full access to all features including user management
- **Manager**: Access to customers, invoices, inventory, and financial data
- **Employee**: Limited access primarily to invoices and customer information

## Multilingual Support

The application supports multiple languages:
- English (default)
- French
- Arabic (with RTL support)

Users can switch languages from the settings menu, and preferences are saved in local storage.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Recharts](https://recharts.org/) for the interactive charts
- [Drizzle ORM](https://orm.drizzle.team/) for the type-safe ORM