import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Import the i18n configuration
import MenuPage from "./pages/MenuPage"; // New page for public menu
import AdminDashboard from "./pages/AdminDashboard"; // New page for admin dashboard

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nextProvider i18n={i18n}> {/* Wrap with I18nextProvider */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<MenuPage />} /> {/* Public menu route */}
            <Route path="/admin" element={<AdminDashboard />} /> {/* Admin dashboard route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </I18nextProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;