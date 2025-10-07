import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MenuPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">{t("menu")}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("This is the public menu page. Food items will be displayed here.")}
      </p>
      <Link to="/">
        <Button variant="outline">{t("home")}</Button>
      </Link>
    </div>
  );
};

export default MenuPage;