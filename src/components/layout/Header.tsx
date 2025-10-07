import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext"; // Import context

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading } = useRestaurantSettings(); // Use context

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={settings.logo_url} alt={settings.name} className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {settings.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
            {t("menu")} {/* Link to menu is now the home link */}
          </Link>
          <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
            {t("admin_dashboard")}
          </Link>
          <LanguageSwitcher />
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link to="/" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                  {t("menu")}
                </Link>
                <Link to="/admin" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                  {t("admin_dashboard")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;