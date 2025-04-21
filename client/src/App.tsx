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
                <ProtectedRoute path="/profile" component={Dashboard} />
                <ProtectedRoute path="/settings" component={Dashboard} />
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
      <div className="flex flex-col border-b pb-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold">{t.title}</h1>
            
            {/* Mobile Navigation */}
            {user && (
              <div className="md:hidden ml-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2 flex items-center">
                      <Menu className="h-4 w-4 mr-1" />
                      <span className="text-xs">Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="text-left">{t.title}</SheetTitle>
                      <SheetDescription className="text-left">Navigation Menu</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 space-y-1">
                      <MobileNavItem to="/" icon={<Home className="w-4 h-4 mr-2" />} label={t.dashboard} />
                      <MobileNavItem to="/calendar" icon={<CalendarIcon className="w-4 h-4 mr-2" />} label={t.calendar} />
                      <MobileNavItem to="/financial-health" icon={<TrendingUp className="w-4 h-4 mr-2" />} label={t.financialHealth} />
                      <MobileNavItem to="/customers" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Customers" />
                      <MobileNavItem to="/invoices" icon={<FileText className="w-4 h-4 mr-2" />} label="Invoices" />
                      <MobileNavItem to="/inventory" icon={<Package className="w-4 h-4 mr-2" />} label="Inventory" />
                      
                      {/* Add common user links */}
                      <div className="h-px bg-gray-200 my-2" />
                      <MobileNavItem to="/profile" icon={<User className="w-4 h-4 mr-2" />} label="Profile" />
                      <MobileNavItem to="/settings" icon={<Settings className="w-4 h-4 mr-2" />} label="Settings" />
                      
                      {/* Admin specific links */}
                      {user?.role === "admin" && (
                        <>
                          <div className="h-px bg-gray-200 my-2" />
                          <MobileNavItem to="/users" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Users" />
                        </>
                      )}
                      
                      <div className="h-px bg-gray-200 my-2" />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full justify-start" 
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher - Simplified for mobile */}
            <div className="hidden sm:flex gap-2">
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
            
            {/* Mobile Language Dropdown */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fr')}>
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')}>
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  <Link href="/profile" className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings" className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
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
        </div>

        {/* Desktop Navigation - Fixed Tabbed Style */}
        {user && (
          <div className="w-full mt-2">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max border-b">
                <NavItem to="/" icon={<Home className="w-4 h-4 mr-2" />} label={t.dashboard} />
                <NavItem to="/calendar" icon={<CalendarIcon className="w-4 h-4 mr-2" />} label={t.calendar} />
                <NavItem to="/financial-health" icon={<TrendingUp className="w-4 h-4 mr-2" />} label={t.financialHealth} />
                <NavItem to="/customers" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Customers" />
                <NavItem to="/invoices" icon={<FileText className="w-4 h-4 mr-2" />} label="Invoices" />
                <NavItem to="/inventory" icon={<Package className="w-4 h-4 mr-2" />} label="Inventory" />
                
                {user?.role === "admin" && (
                  <NavItem to="/users" icon={<UsersIcon className="w-4 h-4 mr-2" />} label="Users" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable component for navigation items
function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  // Check if current path matches the link path
  const isActive = typeof window !== 'undefined' && window.location.pathname === to;
  
  return (
    <Link href={to}>
      <div className={`flex items-center px-4 py-2 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 ${
        isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-700 hover:border-gray-300'
      }`}>
        {icon}
        <span className="truncate max-w-[120px] sm:max-w-none">{label}</span>
      </div>
    </Link>
  );
}

// Mobile navigation item with a different style
function MobileNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  // Check if current path matches the link path
  const isActive = typeof window !== 'undefined' && window.location.pathname === to;
  
  return (
    <Link href={to}>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`w-full justify-start py-3 px-3 h-auto ${
          isActive ? 'bg-blue-50 text-blue-600' : ''
        }`}
      >
        <div className="flex items-center">
          {icon}
          <span className="truncate text-sm">{label}</span>
        </div>
      </Button>
    </Link>
  );
}

export default App;