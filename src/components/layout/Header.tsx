import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/public/placeholder.svg" alt="Restaurant Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t("restaurant_name")}
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
            {t("home")}
          </Link>
          <Link to="/menu" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
            {t("menu")}
          </Link>
          <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors">
            {t("admin_dashboard")}
          </Link>
          <LanguageSwitcher />
          <Button>{t("order_now")}</Button>
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
                  {t("home")}
                </Link>
                <Link to="/menu" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                  {t("menu")}
                </Link>
                <Link to="/admin" className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-primary transition-colors">
                  {t("admin_dashboard")}
                </Link>
                <Button className="w-full mt-4">{t("order_now")}</Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;