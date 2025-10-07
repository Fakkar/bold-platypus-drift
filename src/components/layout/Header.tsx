import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { MenuIcon, LogOut, Phone, Clock } from "lucide-react";
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
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Section: Logo, Name, Slogan */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <img src={settings.logo_url} alt={settings.name} className="h-16 w-16 object-cover rounded-full border-2 border-primary" />
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-white">
              {settings.name}
            </span>
            <span className="text-sm text-gray-300 dark:text-gray-400">
              {t("restaurant_slogan")}
            </span>
          </div>
        </div>

        {/* Right Section: Phone, Working Hours, Language Switcher (Desktop) */}
        <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-2 rtl:space-x-reverse text-white">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-sm">{settings.phone_number}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-2 rtl:space-x-reverse text-white">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm">{settings.working_hours_text}</span>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu (Hamburger Icon) */}
        <div className="md:hidden flex items-center space-x-2 rtl:space-x-reverse">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/20 backdrop-blur-sm text-white border-none hover:bg-white/30">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-gray-800 text-white">
              <nav className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <span>{settings.phone_number}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{settings.working_hours_text}</span>
                </div>
                <LanguageSwitcher />
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">
                  {t("home")}
                </Link>
                <Link to="/#menu-items" className="text-lg font-medium hover:text-primary transition-colors">
                  {t("menu")}
                </Link>
                <Link to="/about" className="text-lg font-medium hover:text-primary transition-colors">
                  {t("about")}
                </Link>
                <Link to="/contact" className="text-lg font-medium hover:text-primary transition-colors">
                  {t("contact")}
                </Link>
                {user && (
                  <Link to="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                    {t("admin_dashboard")}
                  </Link>
                )}
                {user && (
                  <Button variant="ghost" onClick={signOut} className="flex items-center space-x-2 text-lg text-destructive hover:text-destructive-foreground">
                    <LogOut className="h-5 w-5" />
                    <span>{t("logout")}</span>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;