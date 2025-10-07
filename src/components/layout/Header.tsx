import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { MenuIcon, LogOut, Phone, Clock } from "lucide-react"; // Import Phone and Clock icons
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();

  if (settingsLoading || sessionLoading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 bg-opacity-70 text-white py-2 px-4 flex justify-between items-center">
        {/* Phone Number */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Phone className="h-4 w-4 text-primary" />
          <span className="text-sm">{t("phone_number")}</span>
        </div>

        {/* Working Hours */}
        <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm">{t("working_hours_display")}</span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <img src={settings.logo_url} alt={settings.name} className="h-8 w-8 object-contain" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {settings.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
              {t("home")}
            </Link>
            <Link to="/#menu-items" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
              {t("menu")}
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
              {t("about")}
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
              {t("contact")}
            </Link>
            {user && (
              <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
                {t("admin_dashboard")}
              </Link>
            )}
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-700 dark:text-gray-300 hover:text-destructive dark:hover:text-destructive-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </nav>

          <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
            {user && (
              <Button variant="ghost" size="icon" onClick={signOut} className="text-gray-700 dark:text-gray-300 hover:text-destructive dark:hover:text-destructive-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4 mt-6">
                  <Link to="/" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                    {t("home")}
                  </Link>
                  <Link to="/#menu-items" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                    {t("menu")}
                  </Link>
                  <Link to="/about" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                    {t("about")}
                  </Link>
                  <Link to="/contact" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                    {t("contact")}
                  </Link>
                  {user && (
                    <Link to="/admin" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                      {t("admin_dashboard")}
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;