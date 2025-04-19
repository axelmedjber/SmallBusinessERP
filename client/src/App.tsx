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

// Main App component with routing
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="w-full max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-8 my-8">
            <AppHeader />
            <div className="mt-6">
              <Switch>
                <Route path="/auth" component={AuthPage} />
                <ProtectedRoute path="/" component={Dashboard} />
                <ProtectedRoute path="/calendar" component={Calendar} />
                <ProtectedRoute path="/financial-health" component={FinancialHealth} />
                <ProtectedRoute path="/customers" component={Customers} roles={["admin", "manager"]} />
                <ProtectedRoute path="/invoices" component={Invoices} roles={["admin", "manager", "employee"]} />
                <ProtectedRoute path="/inventory" component={Inventory} roles={["admin", "manager"]} />
                <ProtectedRoute path="/users" component={Users} roles={["admin"]} />
                <ProtectedRoute path="/settings" component={Dashboard} roles={["admin"]} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </div>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

// Header with navigation
function AppHeader() {
  const { t, language, direction } = useLanguage();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getUserInitials = () => {
    if (!user) return "?";
    if (user.fullName) {
      const names = user.fullName.split(" ");
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return user.fullName.slice(0, 2).toUpperCase();
    }
    return user.username.slice(0, 2).toUpperCase();
  };
  
  return (
    <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <div className="flex items-center">
          <h1 className="text-2xl sm:text-3xl font-bold mr-6">{t.title}</h1>
          
          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-4">
              <Link href="/">
                <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                  <Home className="w-4 h-4 mr-2" />
                  {t.dashboard}
                </div>
              </Link>
              <Link href="/calendar">
                <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {t.calendar}
                </div>
              </Link>
              <Link href="/financial-health">
                <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t.financialHealth}
                </div>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 text-sm font-medium">
                    More <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link href="/customers">
                    <DropdownMenuItem className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      Customers
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/invoices">
                    <DropdownMenuItem className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2" />
                      Invoices
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/inventory">
                    <DropdownMenuItem className="cursor-pointer">
                      <Package className="w-4 h-4 mr-2" />
                      Inventory
                    </DropdownMenuItem>
                  </Link>
                  {user?.role === "admin" && (
                    <>
                      <Link href="/users">
                        <DropdownMenuItem className="cursor-pointer">
                          <UsersIcon className="w-4 h-4 mr-2" />
                          Users
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          )}
          
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
                  <div className="py-4">
                    <nav className="flex flex-col space-y-3">
                      <Link href="/">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <Home className="w-4 h-4 mr-2" />
                          {t.dashboard}
                        </div>
                      </Link>
                      <Link href="/calendar">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t.calendar}
                        </div>
                      </Link>
                      <Link href="/financial-health">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {t.financialHealth}
                        </div>
                      </Link>
                      <Link href="/customers">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <Users className="w-4 h-4 mr-2" />
                          Customers
                        </div>
                      </Link>
                      <Link href="/invoices">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          Invoices
                        </div>
                      </Link>
                      <Link href="/inventory">
                        <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                          <Package className="w-4 h-4 mr-2" />
                          Inventory
                        </div>
                      </Link>
                      {user?.role === "admin" && (
                        <>
                          <Link href="/users">
                            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                              <UsersIcon className="w-4 h-4 mr-2" />
                              Users
                            </div>
                          </Link>
                          <Link href="/settings">
                            <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 cursor-pointer">
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </div>
                          </Link>
                        </>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <LanguageSwitcher />
          
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
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
              <Button variant="default" size="sm" className="ml-4">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple language switcher component
function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
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
  );
}

export default App;