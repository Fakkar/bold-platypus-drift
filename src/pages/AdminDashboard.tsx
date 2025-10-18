import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";
import { LogOut, Settings, LayoutGrid, ClipboardList, Users, Home, QrCode } from "lucide-react";
import CategoryList from "@/components/admin/CategoryList";
import MenuItemList from "@/components/admin/MenuItemList";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import QRCodeGenerator from "@/components/admin/QRCodeGenerator";
import CustomerClubList from "@/components/admin/CustomerClubList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminView = 'settings' | 'categories' | 'menu-items' | 'customer-club';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();
  const [activeView, setActiveView] = useState<AdminView>('settings');

  if (settingsLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>{t("Loading settings...")}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("unauthorized_access")}</p>
        <Link to="/login">
          <Button className="ml-4">{t("go_to_login")}</Button>
        </Link>
      </div>
    );
  }

  const viewTitles: Record<AdminView, string> = {
    settings: t("restaurant_settings"),
    categories: t("manage_categories"),
    'menu-items': t("manage_menu_items"),
    'customer-club': t("customer_club"),
  };

  return (
    <div className="min-h-screen w-full flex bg-card" dir="rtl">
      <SidebarNav activeView={activeView} setActiveView={setActiveView} signOut={signOut} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">{viewTitles[activeView]}</h1>
        <div className="w-full">
          {activeView === 'settings' && <SettingsPanel settings={settings} />}
          {activeView === 'categories' && <Card><CardContent className="p-6"><CategoryList /></CardContent></Card>}
          {activeView === 'menu-items' && <Card><CardContent className="p-6"><MenuItemList /></CardContent></Card>}
          {activeView === 'customer-club' && <Card><CardContent className="p-6"><CustomerClubList /></CardContent></Card>}
        </div>
      </main>
    </div>
  );
};

// --- Sidebar Navigation Component ---
interface SidebarNavProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  signOut: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activeView, setActiveView, signOut }) => {
  const { t } = useTranslation();
  const { settings } = useRestaurantSettings();

  const navItems = [
    { id: 'settings', label: t('restaurant_settings'), icon: Settings },
    { id: 'categories', label: t('manage_categories'), icon: LayoutGrid },
    { id: 'menu-items', label: t('manage_menu_items'), icon: ClipboardList },
    { id: 'customer-club', label: t('customer_club'), icon: Users },
  ];

  return (
    <aside className="w-64 bg-background border-l border-border flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8">
        <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
        <span className="text-lg font-semibold text-foreground">{settings.name}</span>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => setActiveView(item.id as AdminView)}
            className={cn(
              "justify-start gap-3 px-3 text-base",
              activeView === item.id && "bg-primary text-primary-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        <Link to="/">
          <Button variant="outline" className="w-full justify-start gap-3 px-3">
            <Home className="h-5 w-5" /> {t("back_to_menu")}
          </Button>
        </Link>
        <Button variant="destructive" onClick={signOut} className="w-full justify-start gap-3 px-3">
          <LogOut className="h-5 w-5" /> {t("logout")}
        </Button>
      </div>
    </aside>
  );
};

// --- Settings Panel Component ---
const SettingsPanel: React.FC<{ settings: any }> = ({ settings: initialSettings }) => {
  const { t } = useTranslation();
  const { updateSettings } = useRestaurantSettings();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor();

  const [settings, setSettings] = useState(initialSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'logo') {
        setLogoFile(file);
        setSettings((prev: any) => ({ ...prev, logo_url: URL.createObjectURL(file) }));
      } else {
        setHeroBgFile(file);
        setSettings((prev: any) => ({ ...prev, hero_background_image_url: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogoUrl = settings.logo_url;
    let finalHeroBgUrl = settings.hero_background_image_url;

    if (logoFile) {
      const processed = await compressAndResizeImage(logoFile);
      if (processed) {
        if (initialSettings.logo_url && !initialSettings.logo_url.includes('placeholder')) {
          await deleteFile(initialSettings.logo_url.split('/').pop()!, 'restaurant-logos');
        }
        finalLogoUrl = await uploadFile(processed, 'restaurant-logos') || finalLogoUrl;
      }
    }
    if (heroBgFile) {
      const processed = await compressAndResizeImage(heroBgFile);
      if (processed) {
        if (initialSettings.hero_background_image_url && !initialSettings.hero_background_image_url.includes('hero-bg')) {
          await deleteFile(initialSettings.hero_background_image_url.split('/').pop()!, 'hero-backgrounds');
        }
        finalHeroBgUrl = await uploadFile(processed, 'hero-backgrounds') || finalHeroBgUrl;
      }
    }

    await updateSettings({ ...settings, logo_url: finalLogoUrl, hero_background_image_url: finalHeroBgUrl });
  };

  const isLoading = uploadLoading || imageProcessing;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <Card>
        <CardHeader><CardTitle>{t("general_settings")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("restaurant_name")}</Label>
            <Input id="name" value={settings.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="slogan">{t("restaurant_slogan")}</Label>
            <Input id="slogan" value={settings.slogan} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="logo_url">{t("restaurant_logo_url")}</Label>
            <Input id="logo_url" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} disabled={isLoading} />
            {settings.logo_url && <img src={settings.logo_url} alt="Logo Preview" className="h-16 w-16 mt-2 rounded-full object-cover" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("hero_section_settings")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero_title">{t("hero_title_admin_label")}</Label>
            <Input id="hero_title" value={settings.hero_title} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="hero_description">{t("hero_description_admin_label")}</Label>
            <Textarea id="hero_description" value={settings.hero_description} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="hero_background_image_url">{t("hero_background_image_admin_label")}</Label>
            <Input id="hero_background_image_url" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'hero')} disabled={isLoading} />
            {settings.hero_background_image_url && <img src={settings.hero_background_image_url} alt="Hero BG Preview" className="h-20 w-32 mt-2 rounded-md object-cover" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("footer_settings")}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label htmlFor="address">{t("address")}</Label><Input id="address" value={settings.address} onChange={handleChange} /></div>
          <div><Label htmlFor="phone_number">{t("phone_number")}</Label><Input id="phone_number" value={settings.phone_number} onChange={handleChange} /></div>
          <div><Label htmlFor="working_hours_text">{t("working_hours_display")}</Label><Input id="working_hours_text" value={settings.working_hours_text} onChange={handleChange} /></div>
          <div><Label htmlFor="copyright_text">{t("copyright_text")}</Label><Input id="copyright_text" value={settings.copyright_text} onChange={handleChange} /></div>
          <div className="md:col-span-2"><Label htmlFor="about_us_text">{t("about_us_text")}</Label><Textarea id="about_us_text" value={settings.about_us_text} onChange={handleChange} /></div>
          <div><Label htmlFor="twitter_url">{t("twitter_url")}</Label><Input id="twitter_url" value={settings.twitter_url} onChange={handleChange} /></div>
          <div><Label htmlFor="instagram_url">{t("instagram_url")}</Label><Input id="instagram_url" value={settings.instagram_url} onChange={handleChange} /></div>
          <div><Label htmlFor="facebook_url">{t("facebook_url")}</Label><Input id="facebook_url" value={settings.facebook_url} onChange={handleChange} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t('qr_code_for_menu')}</CardTitle></CardHeader>
        <CardContent><QRCodeGenerator /></CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? t('uploading') : t("save_settings")}
      </Button>
    </form>
  );
};

export default AdminDashboard;