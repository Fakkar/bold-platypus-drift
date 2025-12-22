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
import { RestaurantSettingsProvider, useRestaurantSettings } from "./context/RestaurantSettingsContext";
import Login from "./pages/Login";
import { SessionContextProvider, useSession } from "./context/SessionContext";
import { toast } from "sonner";
import { DynamicTranslationProvider, useDynamicTranslation } from "./context/DynamicTranslationContext";
import { useEffect } from "react";
import UpdatePassword from "./pages/UpdatePassword";
import { TableLocationProvider } from "./context/TableLocationContext"; // Import the new context

const queryClient = new QueryClient();

// Component to set the document title and favicon
const PageMetadataSetter = () => {
  const { settings, loading } = useRestaurantSettings();
  const { tDynamic } = useDynamicTranslation();

  useEffect(() => {
    if (!loading && settings.name) {
      document.title = tDynamic(settings.name);
    }
  }, [settings, loading, tDynamic, settings.name]);

  useEffect(() => {
    if (!loading && settings.logo_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.logo_url;
    }
  }, [settings, loading, settings.logo_url]);

  return null; // This component doesn't render anything
};

// ProtectedRoute component to guard routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useSession();
  const ADMIN_EMAIL = "rahasahamrah@gmail.com"; // Define the admin email

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (user.email !== ADMIN_EMAIL) {
    // If logged in but not the admin email, show unauthorized message and redirect to home
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
                <TableLocationProvider> {/* Wrap with TableLocationProvider */}
                  <PageMetadataSetter />
                  <Routes>
                    <Route path="/" element={<MenuPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
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
                </TableLocationProvider>
              </DynamicTranslationProvider>
            </RestaurantSettingsProvider>
          </SessionContextProvider>
        </BrowserRouter>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;