import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import BuddiesPage from "@/pages/buddies";
import DashboardPage from "@/pages/dashboard";
import { Home, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/buddies", icon: Users, label: "Buddies" },
    { path: "/dashboard", icon: Calendar, label: "Dashboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border md:relative md:border-0 md:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
        <div className="flex justify-around md:justify-center md:gap-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location === path;
            return (
              <Link key={path} href={path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="lg"
                  className="flex-col h-auto py-2 px-4 md:flex-row md:py-3 hover-elevate active-elevate-2"
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  <Icon className="w-5 h-5 md:mr-2" />
                  <span className="text-xs md:text-base mt-1 md:mt-0">{label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/buddies" component={BuddiesPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="md:hidden">
            <Navigation />
          </div>
          <div className="hidden md:block">
            <Navigation />
          </div>
          <main className="flex-1 pb-20 md:pb-0">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
