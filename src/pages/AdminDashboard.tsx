import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext"; // Import useSession
import { toast } from "sonner";
import { LogOut } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession(); // Get user and signOut from session context

  const [restaurantName, setRestaurantName] = useState(settings.name);
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(settings.logo_url);

  useEffect(() => {
    if (!settingsLoading) {
      setRestaurantName(settings.name);
      setRestaurantLogoUrl(settings.logo_url);
    }
  }, [settings, settingsLoading]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({ name: restaurantName, logo_url: restaurantLogoUrl });
  };

  if (settingsLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading settings...")}</p>
      </div>
    );
  }

  // This page is already protected by ProtectedRoute in App.tsx,
  // but an explicit check here can be useful for clarity or if routing changes.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("unauthorized_access")}</p>
        <Link to="/login">
          <Button className="ml-4">{t("go_to_login")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" onClick={signOut} className="flex items-center space-x-2">
          <LogOut className="h-5 w-5" />
          <span>{t("logout")}</span>
        </Button>
      </div>
      <h1 className="text-4xl font-bold mb-6">{t("admin_dashboard")}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("This is the admin dashboard. Here you can manage food items.")}
      </p>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t("restaurant_settings")}</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <Label htmlFor="restaurant-name">{t("restaurant_name")}</Label>
            <Input
              id="restaurant-name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder={t("enter_restaurant_name")}
            />
          </div>
          <div>
            <Label htmlFor="logo-url">{t("restaurant_logo_url")}</Label>
            <Input
              id="logo-url"
              value={restaurantLogoUrl}
              onChange={(e) => setRestaurantLogoUrl(e.target.value)}
              placeholder={t("enter_logo_url")}
            />
            {restaurantLogoUrl && (
              <img src={restaurantLogoUrl} alt="Logo Preview" className="mt-2 h-16 w-16 object-contain" />
            )}
          </div>
          <Button type="submit" className="w-full">{t("save_settings")}</Button>
        </form>
      </div>

      <Link to="/">
        <Button variant="outline">{t("back_to_menu")}</Button>
      </Link>
    </div>
  );
};

export default AdminDashboard;