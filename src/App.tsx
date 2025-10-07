import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import MenuPage from "./pages/MenuPage";
import AdminDashboard from "./pages/AdminDashboard";
import { RestaurantSettingsProvider } from "./context/RestaurantSettingsContext";
import Login from "./pages/Login"; // Import Login page
import { SessionContextProvider, useSession } from "./context/SessionContext"; // Import SessionContext

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}>
        <BrowserRouter> {/* BrowserRouter moved here to wrap everything */}
          <SessionContextProvider>
            <RestaurantSettingsProvider>
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/home" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SessionContextProvider>
        </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;