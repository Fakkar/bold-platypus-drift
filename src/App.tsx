import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import MenuPage from "./pages/MenuPage";
import AdminDashboard from "./pages/AdminDashboard";
import { RestaurantSettingsProvider } from "./context/RestaurantSettingsContext"; // Import the new context provider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}>
        <RestaurantSettingsProvider> {/* Wrap the app with the context provider */}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MenuPage />} /> {/* MenuPage is now the default route */}
              <Route path="/admin" element={<AdminDashboard />} />
              {/* The original Index page is still accessible if needed, but not the default */}
              <Route path="/home" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RestaurantSettingsProvider>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;