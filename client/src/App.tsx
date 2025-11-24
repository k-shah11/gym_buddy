import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import BuddiesPage from "@/pages/buddies";
import DashboardPage from "@/pages/dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Home, Users, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/buddies", icon: Users, label: "Buddies" },
    { path: "/dashboard", icon: Calendar, label: "Dashboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border md:relative md:border-0 md:bg-transparent z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
        <div className="flex justify-around md:justify-between items-center">
          <div className="hidden md:flex gap-4">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location === path;
              return (
                <Link key={path} href={path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    className="hover-elevate active-elevate-2"
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    <span>{label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="md:hidden flex justify-around w-full">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location === path;
              return (
                <Link key={path} href={path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="lg"
                    className="flex-col h-auto py-2 px-4 hover-elevate active-elevate-2"
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs mt-1">{label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="lg"
            className="hidden md:flex hover-elevate active-elevate-2"
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {isAuthenticated && <Navigation />}
      <main className={isAuthenticated ? "flex-1 pb-20 md:pb-0" : "flex-1"}>
        <Switch>
          {!isAuthenticated ? (
            <Route path="/" component={LandingPage} />
          ) : (
            <>
              <Route path="/" component={HomePage} />
              <Route path="/buddies" component={BuddiesPage} />
              <Route path="/dashboard" component={DashboardPage} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
