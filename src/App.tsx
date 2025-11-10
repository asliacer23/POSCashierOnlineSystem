import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Inventory from "./pages/admin/Inventory";
import Analytics from "./pages/admin/Analytics";
import Cashiers from "./pages/admin/Cashiers";
import CashierDashboard from "./pages/cashier/Dashboard";
import CashierOrders from "./pages/cashier/Orders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/inventory" element={
                <ProtectedRoute requiredRole="admin">
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/cashiers" element={
                <ProtectedRoute requiredRole="admin">
                  <Cashiers />
                </ProtectedRoute>
              } />

              {/* Cashier Routes */}
              <Route path="/cashier" element={
                <ProtectedRoute requiredRole="cashier">
                  <CashierDashboard />
                </ProtectedRoute>
              } />
              <Route path="/cashier/orders" element={
                <ProtectedRoute requiredRole="cashier">
                  <CashierOrders />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
