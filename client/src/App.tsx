import React from "react";
import { Route, Switch, Link } from "wouter";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import FinancialHealth from "./pages/FinancialHealth";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useLanguage } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Home,
  Calendar as CalendarIcon,
  TrendingUp,
  Menu,
  Users as UsersIcon,
  FileText,
  Package,
  Settings,
  LogOut,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-8 my-8">
            <AppHeader />
            <div className="mt-6">
              <Switch>
                <Route path="/auth">
                  <AuthPage />
                </Route>
                <ProtectedRoute path="/" component={Dashboard} />
                <ProtectedRoute path="/calendar" component={Calendar} />
                <ProtectedRoute path="/financial-health" component={FinancialHealth} />
                <ProtectedRoute path="/customers" component={Customers} roles={["admin", "manager"]} />
                <ProtectedRoute path="/invoices" component={Invoices} roles={["admin", "manager", "employee"]} />
                <ProtectedRoute path="/inventory" component={Inventory} roles={["admin", "manager"]} />
                <ProtectedRoute path="/users" component={Users} roles={["admin"]} />
                <ProtectedRoute path="/settings" component={Dashboard} roles={["admin"]} />
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

function AppHeader() {
  const { t, language, direction, setLanguage } = useLanguage();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => logoutMutation.mutate();

  const getUserInitials = () => {
    if (!user) return "?";
    if (user.fullName) {
      const names = user.fullName.split(" ");
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : user.fullName.slice(0, 2).toUpperCase();
    }
    return user.username?.slice(0, 2).toUpperCase() || "?";
  };

  return (
    <div className={direction === "rtl" ? "text-right" : "text-left"}>
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold mr-6">{t.title}</h1>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-4">
              <NavItem to="/" icon={<Home className="w-4 h-4 mr-2" />} label={t.dashboard} />
              <NavItem to="/calendar" icon={<CalendarIcon className="w-4 h-4 mr-2" />} label={t.calendar} />
              <NavItem to="/financial-health" icon={<TrendingUp className="w-4 h-4 mr-2" />} label={t.financialHealth} />
              <NavItem to="/customers" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Customers" />
              <NavItem to="/invoices" icon={<FileText className="w-4 h-4 mr-2" />} label="Invoices" />
              <NavItem to="/inventory" icon={<Package className="w-4 h-4 mr-2" />} label="Inventory" />
              
              {user?.role === "admin" && (
                <NavItem to="/users" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Users" />
              )}
            </nav>
          )}
        </div>

        {/* Language and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex gap-2">
            <button
              className={`px-2 py-1 text-xs rounded-md ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-md ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setLanguage('fr')}
            >
              FR
            </button>
            <button
              className={`px-2 py-1 text-xs rounded-md ${language === 'ar' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setLanguage('ar')}
            >
              عربي
            </button>
          </div>
          
          {/* User Profile Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="default" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>{t.title}</SheetTitle>
                  <SheetDescription>Navigation Menu</SheetDescription>
                </SheetHeader>
                <div className="py-4 space-y-3">
                  <NavItem to="/" icon={<Home className="w-4 h-4 mr-2" />} label={t.dashboard} />
                  <NavItem to="/calendar" icon={<CalendarIcon className="w-4 h-4 mr-2" />} label={t.calendar} />
                  <NavItem to="/financial-health" icon={<TrendingUp className="w-4 h-4 mr-2" />} label={t.financialHealth} />
                  <NavItem to="/customers" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Customers" />
                  <NavItem to="/invoices" icon={<FileText className="w-4 h-4 mr-2" />} label="Invoices" />
                  <NavItem to="/inventory" icon={<Package className="w-4 h-4 mr-2" />} label="Inventory" />
                  
                  {user?.role === "admin" && (
                    <>
                      <NavItem to="/users" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Users" />
                      <NavItem to="/settings" icon={<Settings className="w-4 h-4 mr-2" />} label="Settings" />
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable component for navigation items
function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={to}>
      <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
        {icon}
        {label}
      </div>
    </Link>
  );
}

export default App;