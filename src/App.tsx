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
import Login from "./pages/Login";
import { SessionContextProvider, useSession } from "./context/SessionContext";
import { toast } from "sonner";
import { DynamicTranslationProvider } from "./context/DynamicTranslationContext";

const queryClient = new QueryClient();

// ProtectedRoute component to guard routes based on roles
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>Loading authentication...</p>
      </div>
    );
  }

  // Allow access if the user has a profile and their role is either 'admin' or 'editor'
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    toast.error(i18n.t("unauthorized_access"));
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <SessionContextProvider>
            <RestaurantSettingsProvider>
              <DynamicTranslationProvider>
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
              </DynamicTranslationProvider>
            </RestaurantSettingsProvider>
          </SessionContextProvider>
        </BrowserRouter>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;