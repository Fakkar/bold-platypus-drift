import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6">{t("admin_dashboard")}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("This is the admin dashboard. Here you can manage food items.")}
      </p>
      <Link to="/">
        <Button variant="outline">{t("home")}</Button>
      </Link>
    </div>
  );
};

export default AdminDashboard;