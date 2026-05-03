import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import { MainLayout } from "@/components/MainLayout";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Kyc from "@/pages/Kyc";
import Licenses from "@/pages/Licenses";
import Profile from "@/pages/Profile";
import AdminRouter from "@/pages/admin/AdminRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="font-mono text-primary animate-pulse text-sm uppercase tracking-widest">Verifying clearance...</div>
    </div>
  );

  if (!isAuthenticated) return <Redirect to="/login" />;

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="font-mono text-primary animate-pulse text-sm uppercase tracking-widest">Verifying clearance...</div>
    </div>
  );

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/" />;

  return <Component />;
}

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />

        <Route path="/cart">
          <ProtectedRoute component={Cart} />
        </Route>
        <Route path="/checkout">
          <ProtectedRoute component={Checkout} />
        </Route>
        <Route path="/orders">
          <ProtectedRoute component={Orders} />
        </Route>
        <Route path="/orders/:id">
          <ProtectedRoute component={OrderDetail} />
        </Route>
        <Route path="/kyc">
          <ProtectedRoute component={Kyc} />
        </Route>
        <Route path="/licenses">
          <ProtectedRoute component={Licenses} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>

        <Route path="/admin">
          <AdminRoute component={AdminRouter} />
        </Route>
        <Route path="/admin/:rest*">
          <AdminRoute component={AdminRouter} />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
