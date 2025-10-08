import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea for description
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryList from "@/components/admin/CategoryList";
import MenuItemList from "@/components/admin/MenuItemList";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useImageProcessor } from "@/hooks/useImageProcessor";

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor();

  const [restaurantName, setRestaurantName] = useState(settings.name);
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(settings.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [restaurantSlogan, setRestaurantSlogan] = useState(settings.slogan);
  const [restaurantPhoneNumber, setRestaurantPhoneNumber] = useState(settings.phone_number);
  const [restaurantWorkingHoursText, setRestaurantWorkingHoursText] = useState(settings.working_hours_text);
  
  // New states for Hero Section
  const [heroTitle, setHeroTitle] = useState(settings.hero_title);
  const [heroDescription, setHeroDescription] = useState(settings.hero_description);
  const [heroBackgroundImageUrl, setHeroBackgroundImageUrl] = useState(settings.hero_background_image_url);
  const [heroBackgroundImageFile, setHeroBackgroundImageFile] = useState<File | null>(null);


  useEffect(() => {
    if (!settingsLoading) {
      setRestaurantName(settings.name);
      setRestaurantLogoUrl(settings.logo_url);
      setRestaurantSlogan(settings.slogan);
      setRestaurantPhoneNumber(settings.phone_number);
      setRestaurantWorkingHoursText(settings.working_hours_text);
      // Update new states
      setHeroTitle(settings.hero_title);
      setHeroDescription(settings.hero_description);
      setHeroBackgroundImageUrl(settings.hero_background_image_url);
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
      const filePath = settings.logo_url.split('/restaurant-logos/')[1];
      await deleteFile(filePath, 'restaurant-logos');
    }
    setRestaurantLogoUrl('/public/placeholder.svg');
    setLogoFile(null);
  };

  const handleHeroBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroBackgroundImageFile(e.target.files[0]);
      setHeroBackgroundImageUrl(URL.createObjectURL(e.target.files[0])); // For preview
    }
  };

  const handleRemoveHeroBackground = async () => {
    if (settings.hero_background_image_url && settings.hero_background_image_url !== '/public/hero-bg.jpg') {
      const filePath = settings.hero_background_image_url.split('/hero-backgrounds/')[1];
      await deleteFile(filePath, 'hero-backgrounds');
    }
    setHeroBackgroundImageUrl('/public/hero-bg.jpg');
    setHeroBackgroundImageFile(null);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogoUrl = restaurantLogoUrl;
    let finalHeroBackgroundImageUrl = heroBackgroundImageUrl;

    // Handle logo upload/delete
    if (logoFile) {
      const processedFile = await compressAndResizeImage(logoFile);
      if (!processedFile) {
        toast.error(t('failed_to_upload_logo'));
        return;
      }
      if (settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
        const oldFilePath = settings.logo_url.split('/restaurant-logos/')[1];
        await deleteFile(oldFilePath, 'restaurant-logos');
      }
      const uploadedUrl = await uploadFile(processedFile, 'restaurant-logos');
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl;
      } else {
        toast.error(t('failed_to_upload_logo'));
        return;
      }
    } else if (!restaurantLogoUrl && settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
      const oldFilePath = settings.logo_url.split('/restaurant-logos/')[1];
      await deleteFile(oldFilePath, 'restaurant-logos');
      finalLogoUrl = '/public/placeholder.svg';
    } else if (!restaurantLogoUrl) {
      finalLogoUrl = '/public/placeholder.svg';
    }

    // Handle hero background image upload/delete
    if (heroBackgroundImageFile) {
      const processedFile = await compressAndResizeImage(heroBackgroundImageFile);
      if (!processedFile) {
        toast.error(t('failed_to_upload_hero_background')); // New translation key needed
        return;
      }
      if (settings.hero_background_image_url && settings.hero_background_image_url !== '/public/hero-bg.jpg') {
        const oldFilePath = settings.hero_background_image_url.split('/hero-backgrounds/')[1];
        await deleteFile(oldFilePath, 'hero-backgrounds');
      }
      const uploadedUrl = await uploadFile(processedFile, 'hero-backgrounds');
      if (uploadedUrl) {
        finalHeroBackgroundImageUrl = uploadedUrl;
      } else {
        toast.error(t('failed_to_upload_hero_background')); // New translation key needed
        return;
      }
    } else if (!heroBackgroundImageUrl && settings.hero_background_image_url && settings.hero_background_image_url !== '/public/hero-bg.jpg') {
      const oldFilePath = settings.hero_background_image_url.split('/hero-backgrounds/')[1];
      await deleteFile(oldFilePath, 'hero-backgrounds');
      finalHeroBackgroundImageUrl = '/public/hero-bg.jpg';
    } else if (!heroBackgroundImageUrl) {
      finalHeroBackgroundImageUrl = '/public/hero-bg.jpg';
    }


    await updateSettings({ 
      name: restaurantName, 
      logo_url: finalLogoUrl,
      slogan: restaurantSlogan,
      phone_number: restaurantPhoneNumber,
      working_hours_text: restaurantWorkingHoursText,
      hero_title: heroTitle, // Save new hero title
      hero_description: heroDescription, // Save new hero description
      hero_background_image_url: finalHeroBackgroundImageUrl, // Save new hero background image URL
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
                disabled={uploadLoading || imageProcessing}
              />
              {restaurantLogoUrl && (
                <div className="mt-2 flex items-center space-x-4">
                  <img src={restaurantLogoUrl} alt="Logo Preview" className="h-16 w-16 object-contain rounded-full border-2 border-primary" />
                  <Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive" disabled={uploadLoading || imageProcessing}>
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

            {/* New fields for Hero Section */}
            <h3 className="text-xl font-semibold mt-6">{t("hero_section_settings")}</h3>
            <div>
              <Label htmlFor="hero-title">{t("hero_title_admin_label")}</Label>
              <Input
                id="hero-title"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder={t("enter_hero_title")}
              />
            </div>
            <div>
              <Label htmlFor="hero-description">{t("hero_description_admin_label")}</Label>
              <Textarea
                id="hero-description"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                placeholder={t("enter_hero_description")}
              />
            </div>
            <div>
              <Label htmlFor="hero-background-image">{t("hero_background_image_admin_label")}</Label>
              <Input
                id="hero-background-image"
                type="file"
                accept="image/*"
                onChange={handleHeroBackgroundChange}
                disabled={uploadLoading || imageProcessing}
              />
              {heroBackgroundImageUrl && (
                <div className="mt-2 flex items-center space-x-4">
                  <img src={heroBackgroundImageUrl} alt="Hero Background Preview" className="h-16 w-24 object-cover rounded-md border-2 border-primary" />
                  <Button variant="ghost" size="sm" onClick={handleRemoveHeroBackground} className="text-destructive" disabled={uploadLoading || imageProcessing}>
                    {t('remove_image')}
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={uploadLoading || imageProcessing}>
              {uploadLoading || imageProcessing ? t('uploading') : t("save_settings")}
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