import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryList from "@/components/admin/CategoryList";
import MenuItemList from "@/components/admin/MenuItemList";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage"; // Import useSupabaseStorage

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage(); // Initialize storage hook

  const [restaurantName, setRestaurantName] = useState(settings.name);
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(settings.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null); // State for uploaded logo file
  const [restaurantSlogan, setRestaurantSlogan] = useState(settings.slogan);
  const [restaurantPhoneNumber, setRestaurantPhoneNumber] = useState(settings.phone_number);
  const [restaurantWorkingHoursText, setRestaurantWorkingHoursText] = useState(settings.working_hours_text);


  useEffect(() => {
    if (!settingsLoading) {
      setRestaurantName(settings.name);
      setRestaurantLogoUrl(settings.logo_url);
      setRestaurantSlogan(settings.slogan);
      setRestaurantPhoneNumber(settings.phone_number);
      setRestaurantWorkingHoursText(settings.working_hours_text);
    }
  }, [settings, settingsLoading]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setRestaurantLogoUrl(URL.createObjectURL(e.target.files[0])); // For preview
    }
  };

  const handleRemoveLogo = async () => {
    if (settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
      const filePath = settings.logo_url.split('/public/')[1]; // Extract path from URL
      await deleteFile(filePath, 'restaurant-logos');
    }
    setRestaurantLogoUrl('/public/placeholder.svg');
    setLogoFile(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogoUrl = restaurantLogoUrl;

    if (logoFile) {
      // If there's an old logo and a new one is uploaded, delete the old one
      if (settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
        const oldFilePath = settings.logo_url.split('/public/')[1]; // Extract path from URL
        await deleteFile(oldFilePath, 'restaurant-logos');
      }
      const uploadedUrl = await uploadFile(logoFile, 'restaurant-logos');
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl;
      } else {
        toast.error(t('failed_to_upload_logo'));
        return; // Stop if image upload failed
      }
    } else if (!restaurantLogoUrl && settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
      // If logo was removed and it was not a placeholder, delete from storage
      const oldFilePath = settings.logo_url.split('/public/')[1];
      await deleteFile(oldFilePath, 'restaurant-logos');
      finalLogoUrl = '/public/placeholder.svg';
    } else if (!restaurantLogoUrl) {
      finalLogoUrl = '/public/placeholder.svg';
    }

    await updateSettings({ 
      name: restaurantName, 
      logo_url: finalLogoUrl,
      slogan: restaurantSlogan,
      phone_number: restaurantPhoneNumber,
      working_hours_text: restaurantWorkingHoursText,
    });
  };

  if (settingsLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading settings...")}</p>
      </div>
    );
  }

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
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" onClick={signOut} className="flex items-center space-x-2">
          <LogOut className="h-5 w-5" />
          <span>{t("logout")}</span>
        </Button>
      </div>
      <h1 className="text-4xl font-bold mb-6 mt-12">{t("admin_dashboard")}</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
        {t("This is the admin dashboard. Here you can manage food items.")}
      </p>

      <Tabs defaultValue="settings" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">{t("restaurant_settings")}</TabsTrigger>
          <TabsTrigger value="categories">{t("manage_categories")}</TabsTrigger>
          <TabsTrigger value="menu-items">{t("manage_menu_items")}</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
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
              <Label htmlFor="restaurant-slogan">{t("restaurant_slogan")}</Label>
              <Input
                id="restaurant-slogan"
                value={restaurantSlogan}
                onChange={(e) => setRestaurantSlogan(e.target.value)}
                placeholder={t("enter_restaurant_slogan")}
              />
            </div>
            <div>
              <Label htmlFor="logo-upload">{t("restaurant_logo_url")}</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={uploadLoading}
              />
              {restaurantLogoUrl && (
                <div className="mt-2 flex items-center space-x-4">
                  <img src={restaurantLogoUrl} alt="Logo Preview" className="h-16 w-16 object-contain rounded-full border-2 border-primary" />
                  <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive" disabled={uploadLoading}>
                    {t('remove_image')}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="phone-number">{t("phone_number")}</Label>
              <Input
                id="phone-number"
                value={restaurantPhoneNumber}
                onChange={(e) => setRestaurantPhoneNumber(e.target.value)}
                placeholder={t("enter_phone_number")}
              />
            </div>
            <div>
              <Label htmlFor="working-hours-text">{t("working_hours_display")}</Label>
              <Input
                id="working-hours-text"
                value={restaurantWorkingHoursText}
                onChange={(e) => setRestaurantWorkingHoursText(e.target.value)}
                placeholder={t("enter_working_hours_text")}
              />
            </div>
            <Button type="submit" className="w-full" disabled={uploadLoading}>
              {uploadLoading ? t('uploading') : t("save_settings")}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="categories" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
          <CategoryList />
        </TabsContent>
        <TabsContent value="menu-items" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
          <MenuItemList />
        </TabsContent>
      </Tabs>

      <Link to="/" className="mt-8">
        <Button variant="outline">{t("back_to_menu")}</Button>
      </Link>
    </div>
  );
};

export default AdminDashboard;