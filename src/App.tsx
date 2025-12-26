import { toast } from 'react-hot-toast';
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
import { SessionContextProvider } from "./context/SessionContext";
import { DynamicTranslationProvider } from "./context/DynamicTranslationContext";
import UpdatePassword from "./pages/UpdatePassword";
import { TableLocationProvider } from "./context/TableLocationContext";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <SessionContextProvider>
            <RestaurantSettingsProvider>
              <DynamicTranslationProvider>
                <TableLocationProvider>
                  <CartProvider>
                    <Routes>
                      <Route path="/" element={<MenuPage />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/update-password" element={<UpdatePassword />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/home" element={<Index />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </CartProvider>
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