import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryList from "@/components/admin/CategoryList";
import MenuItemList from "@/components/admin/MenuItemList";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import QRCodeGenerator from "@/components/admin/QRCodeGenerator"; // Import QRCodeGenerator

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor();

  // General Settings
  const [restaurantName, setRestaurantName] = useState(settings.name);
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(settings.logo_url);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [restaurantSlogan, setRestaurantSlogan] = useState(settings.slogan);
  
  // Hero Section Settings
  const [heroTitle, setHeroTitle] = useState(settings.hero_title);
  const [heroDescription, setHeroDescription] = useState(settings.hero_description);
  const [heroBackgroundImageUrl, setHeroBackgroundImageUrl] = useState(settings.hero_background_image_url);
  const [heroBackgroundImageFile, setHeroBackgroundImageFile] = useState<File | null>(null);

  // Footer Settings
  const [address, setAddress] = useState(settings.address);
  const [phoneNumber, setPhoneNumber] = useState(settings.phone_number);
  const [workingHoursText, setWorkingHoursText] = useState(settings.working_hours_text);
  const [aboutUsText, setAboutUsText] = useState(settings.about_us_text);
  const [twitterUrl, setTwitterUrl] = useState(settings.twitter_url);
  const [instagramUrl, setInstagramUrl] = useState(settings.instagram_url);
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url);
  const [copyrightText, setCopyrightText] = useState(settings.copyright_text);

  useEffect(() => {
    if (!settingsLoading) {
      setRestaurantName(settings.name);
      setRestaurantLogoUrl(settings.logo_url);
      setRestaurantSlogan(settings.slogan);
      setHeroTitle(settings.hero_title);
      setHeroDescription(settings.hero_description);
      setHeroBackgroundImageUrl(settings.hero_background_image_url);
      setAddress(settings.address);
      setPhoneNumber(settings.phone_number);
      setWorkingHoursText(settings.working_hours_text);
      setAboutUsText(settings.about_us_text);
      setTwitterUrl(settings.twitter_url);
      setInstagramUrl(settings.instagram_url);
      setFacebookUrl(settings.facebook_url);
      setCopyrightText(settings.copyright_text);
    }
  }, [settings, settingsLoading]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setRestaurantLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleHeroBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroBackgroundImageFile(e.target.files[0]);
      setHeroBackgroundImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogoUrl = restaurantLogoUrl;
    let finalHeroBackgroundImageUrl = heroBackgroundImageUrl;

    if (logoFile) {
      const processedFile = await compressAndResizeImage(logoFile);
      if (processedFile) {
        if (settings.logo_url && settings.logo_url !== '/public/placeholder.svg') {
          const oldFilePath = settings.logo_url.split('/restaurant-logos/')[1];
          await deleteFile(oldFilePath, 'restaurant-logos');
        }
        finalLogoUrl = await uploadFile(processedFile, 'restaurant-logos') || finalLogoUrl;
      }
    }

    if (heroBackgroundImageFile) {
      const processedFile = await compressAndResizeImage(heroBackgroundImageFile);
      if (processedFile) {
        if (settings.hero_background_image_url && settings.hero_background_image_url !== '/public/hero-bg.jpg') {
          const oldFilePath = settings.hero_background_image_url.split('/hero-backgrounds/')[1];
          await deleteFile(oldFilePath, 'hero-backgrounds');
        }
        finalHeroBackgroundImageUrl = await uploadFile(processedFile, 'hero-backgrounds') || finalHeroBackgroundImageUrl;
      }
    }

    await updateSettings({ 
      name: restaurantName, 
      logo_url: finalLogoUrl,
      slogan: restaurantSlogan,
      hero_title: heroTitle,
      hero_description: heroDescription,
      hero_background_image_url: finalHeroBackgroundImageUrl,
      address,
      phone_number: phoneNumber,
      working_hours_text: workingHoursText,
      about_us_text: aboutUsText,
      twitter_url: twitterUrl,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      copyright_text: copyrightText,
    });
  };

  if (settingsLoading || sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>{t("Loading settings...")}</p></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("unauthorized_access")}</p>
        <Link to="/login"><Button className="ml-4">{t("go_to_login")}</Button></Link>
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
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{t("This is the admin dashboard. Here you can manage food items.")}</p>

      <Tabs defaultValue="settings" className="w-full max-w-4xl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">{t("restaurant_settings")}</TabsTrigger>
          <TabsTrigger value="categories">{t("manage_categories")}</TabsTrigger>
          <TabsTrigger value="menu-items">{t("manage_menu_items")}</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* General Settings */}
            <h3 className="text-xl font-semibold">{t("general_settings")}</h3>
            <div>
              <Label htmlFor="restaurant-name">{t("restaurant_name")}</Label>
              <Input id="restaurant-name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="restaurant-slogan">{t("restaurant_slogan")}</Label>
              <Input id="restaurant-slogan" value={restaurantSlogan} onChange={(e) => setRestaurantSlogan(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="logo-upload">{t("restaurant_logo_url")}</Label>
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} disabled={uploadLoading || imageProcessing} />
              {restaurantLogoUrl && <img src={restaurantLogoUrl} alt="Logo Preview" className="h-16 w-16 mt-2" />}
            </div>

            {/* Hero Section Settings */}
            <h3 className="text-xl font-semibold border-t pt-6">{t("hero_section_settings")}</h3>
            <div>
              <Label htmlFor="hero-title">{t("hero_title_admin_label")}</Label>
              <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hero-description">{t("hero_description_admin_label")}</Label>
              <Textarea id="hero-description" value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hero-background-image">{t("hero_background_image_admin_label")}</Label>
              <Input id="hero-background-image" type="file" accept="image/*" onChange={handleHeroBackgroundChange} disabled={uploadLoading || imageProcessing} />
              {heroBackgroundImageUrl && <img src={heroBackgroundImageUrl} alt="Hero BG Preview" className="h-16 w-24 mt-2" />}
            </div>

            {/* Footer Settings */}
            <h3 className="text-xl font-semibold border-t pt-6">{t("footer_settings")}</h3>
            <div>
              <Label htmlFor="address">{t("address")}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone-number">{t("phone_number")}</Label>
              <Input id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="working-hours-text">{t("working_hours_display")}</Label>
              <Input id="working-hours-text" value={workingHoursText} onChange={(e) => setWorkingHoursText(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="about-us-text">{t("about_us_text")}</Label>
              <Textarea id="about-us-text" value={aboutUsText} onChange={(e) => setAboutUsText(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="twitter-url">{t("twitter_url")}</Label>
              <Input id="twitter-url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="instagram-url">{t("instagram_url")}</Label>
              <Input id="instagram-url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="facebook-url">{t("facebook_url")}</Label>
              <Input id="facebook-url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="copyright-text">{t("copyright_text")}</Label>
              <Input id="copyright-text" value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-4">{t('qr_code_for_menu')}</h3>
              <QRCodeGenerator />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={uploadLoading || imageProcessing}>
              {uploadLoading || imageProcessing ? t('uploading') : t("save_settings")}
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="categories" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4"><CategoryList /></TabsContent>
        <TabsContent value="menu-items" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-4"><MenuItemList /></TabsContent>
      </Tabs>
      <Link to="/" className="mt-8"><Button variant="outline">{t("back_to_menu")}</Button></Link>
    </div>
  );
};

export default AdminDashboard;