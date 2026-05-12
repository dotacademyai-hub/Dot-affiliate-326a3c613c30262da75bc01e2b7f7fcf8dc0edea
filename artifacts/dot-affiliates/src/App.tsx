import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MockPlatform from "@/pages/MockPlatform";

// Initialize API client with backend URL from environment
const apiUrl = import.meta.env.VITE_API_URL || "";
setBaseUrl(apiUrl);

const queryClient = new QueryClient();

export function ProtectedRoute({ component: Component, admin = false, ...rest }: { component: any, admin?: boolean }) {
  const [location, setLocation] = useLocation();
  const token = localStorage.getItem(admin ? "adminToken" : "affiliateToken");

  if (!token) {
    setLocation("/auth");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route path="/fearless-control-gate-2025">
        {() => <ProtectedRoute admin component={AdminDashboard} />}
      </Route>
      <Route path="/demo" component={MockPlatform} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen">
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
