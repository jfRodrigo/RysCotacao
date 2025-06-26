import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Auth pages
import Login from "@/pages/Login";

// Root pages
import { RootLayout } from "@/components/layouts/RootLayout";
import RootDashboard from "@/pages/root/RootDashboard";
import Municipalities from "@/pages/root/Municipalities";
import Users from "@/pages/root/Users";
import GlobalQuotations from "@/pages/root/GlobalQuotations";
import Reports from "@/pages/root/Reports";
import AccessLogs from "@/pages/root/AccessLogs";
import Settings from "@/pages/root/Settings";

// Municipal pages
import { MunicipalLayout } from "@/components/layouts/MunicipalLayout";
import MunicipalDashboard from "@/pages/municipal/MunicipalDashboard";
import MyQuotations from "@/pages/municipal/MyQuotations";
import NewQuotation from "@/pages/municipal/NewQuotation";
import MunicipalReports from "@/pages/municipal/Reports";
import Team from "@/pages/municipal/Team";

// 404 page
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function RootProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isRoot } = useAuth();

  if (!user || !isRoot) {
    return <Redirect to="/municipal/dashboard" />;
  }

  return <>{children}</>;
}

function MunicipalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isMunicipal } = useAuth();

  if (!user || !isMunicipal) {
    return <Redirect to="/root/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />

      {/* Root redirect */}
      <Route path="/">
        {user ? (
          user.role === 'root' ? (
            <Redirect to="/root/dashboard" />
          ) : (
            <Redirect to="/municipal/dashboard" />
          )
        ) : (
          <Redirect to="/login" />
        )}
      </Route>

      {/* ROOT Admin Routes */}
      <Route path="/root/dashboard">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <RootDashboard />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/municipalities">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <Municipalities />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/users">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <Users />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/quotations">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <GlobalQuotations />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/reports">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <Reports />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/access-logs">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <AccessLogs />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/root/settings">
        <ProtectedRoute>
          <RootProtectedRoute>
            <RootLayout>
              <Settings />
            </RootLayout>
          </RootProtectedRoute>
        </ProtectedRoute>
      </Route>

      {/* Municipal Routes */}
      <Route path="/municipal/dashboard">
        <ProtectedRoute>
          <MunicipalProtectedRoute>
            <MunicipalLayout>
              <MunicipalDashboard />
            </MunicipalLayout>
          </MunicipalProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/municipal/quotations">
        <ProtectedRoute>
          <MunicipalProtectedRoute>
            <MunicipalLayout>
              <MyQuotations />
            </MunicipalLayout>
          </MunicipalProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/municipal/new-quotation">
        <ProtectedRoute>
          <MunicipalProtectedRoute>
            <MunicipalLayout>
              <NewQuotation />
            </MunicipalLayout>
          </MunicipalProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/municipal/reports">
        <ProtectedRoute>
          <MunicipalProtectedRoute>
            <MunicipalLayout>
              <MunicipalReports />
            </MunicipalLayout>
          </MunicipalProtectedRoute>
        </ProtectedRoute>
      </Route>

      <Route path="/municipal/team">
        <ProtectedRoute>
          <MunicipalProtectedRoute>
            <MunicipalLayout>
              <Team />
            </MunicipalLayout>
          </MunicipalProtectedRoute>
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
