import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useSession } from "@/context/SessionContext";
import { LogOut, Settings, LayoutGrid, ClipboardList, Users, Home, BarChart, Map, BellRing, ReceiptText, Play } from "lucide-react"; // Import Play icon
import CategoryList from "@/components/admin/CategoryList";
import MenuItemList from "@/components/admin/MenuItemList";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import QRCodeGenerator from "@/components/admin/QRCodeGenerator";
import CustomerClubList from "@/components/admin/CustomerClubList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";
import CustomerClubReport from "@/components/admin/CustomerClubReport";
import LocationManager from "@/components/admin/LocationManager";
import WaiterCallList from "@/components/admin/WaiterCallList";
import OrderList from "@/components/admin/OrderList";
import { toast } from 'sonner';
import AdminRealtimeNotifications from "@/components/admin/AdminRealtimeNotifications";

type AdminView = 'settings' | 'categories' | 'menu-items' | 'customer-club' | 'customer-club-report' | 'locations' | 'waiter-calls' | 'orders';

interface AdminNotificationItem {
  id: string;
  type: 'order' | 'waiter';
  locationName: string;
  message?: string;
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading: settingsLoading } = useRestaurantSettings();
  const { user, signOut, loading: sessionLoading } = useSession();
  const [activeView, setActiveView] = useState<AdminView>('settings');
  const location = useLocation();
  const [notificationQueue, setNotificationQueue] = useState<AdminNotificationItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<AdminNotificationItem | null>(null);


  const viewTitles: Record<AdminView, string> = {
    settings: t("restaurant_settings"),
    categories: t("manage_categories"),
    'menu-items': t("manage_menu_items"),
    'customer-club': t("customer_club"),
    'customer-club-report': t("customer_club_report"),
    'locations': t("manage_locations"),
    'waiter-calls': t("waiter_calls"),
    'orders': t("manage_orders"),
  };

  useEffect(() => {
    // Check URL for initial view
    const params = new URLSearchParams(location.search);
    const viewFromUrl = params.get('view') as AdminView;
    if (viewFromUrl && viewTitles[viewFromUrl]) {
      setActiveView(viewFromUrl);
    }
    // Test sonner toast on dashboard load
    console.log("Admin Dashboard loaded, attempting to show test toast.");
    toast.info(t("admin_dashboard_loaded_test_toast"));
  }, [location.search, t]); // Added location.search to dependencies


  useEffect(() => {
    if (sessionLoading || !user) {
      return;
    }

    if (!('Notification' in window) || Notification.permission !== 'default') {
      return;
    }

    Notification.requestPermission().catch((error) => {
      console.error('Failed to request notification permission:', error);
    });
  }, [sessionLoading, user]);

  useEffect(() => {
    if (activeNotification || notificationQueue.length === 0) {
      return;
    }

    const [nextNotification, ...restQueue] = notificationQueue;
    setActiveNotification(nextNotification);
    setNotificationQueue(restQueue);
  }, [activeNotification, notificationQueue]);

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

  const handleShowNotification = (type: 'order' | 'waiter', locationName: string, message?: string) => {
    const audioSrc = type === 'order' ? settings.order_sound_url : settings.waiter_call_sound_url;

    if (audioSrc) {
      const dingAudio = new Audio(audioSrc);
      dingAudio.play().catch((error) => {
        console.error(`Error playing ${type} notification sound:`, error);
      });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const title = type === 'order'
        ? t('new_order_notification', { location: locationName })
        : t('new_waiter_call_notification', { location: locationName });
      const body = message || (type === 'order' ? t('new_order_notification_generic') : t('new_waiter_call_notification_generic'));
      new Notification(title, { body, requireInteraction: true });
    }

    const newNotification: AdminNotificationItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      type,
      locationName,
      message,
    };

    setNotificationQueue((prevQueue) => [...prevQueue, newNotification]);
  };

  const handleAcknowledgeNotification = () => {
    if (!activeNotification) {
      return;
    }

    setActiveView(activeNotification.type === 'order' ? 'orders' : 'waiter-calls');
    setActiveNotification(null);
  };

  const handleTestWaiterCall = () => {
    handleShowNotification('waiter', 'میز تست ۱');
  };

  const handleTestOrder = () => {
    handleShowNotification('order', 'میز تست ۲');
  };

  return (
    <div className="min-h-screen w-full flex bg-card" dir="rtl">
      <SidebarNav activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <AdminRealtimeNotifications onShowNotification={handleShowNotification} />
        {activeNotification && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-2xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <BellRing className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  {activeNotification.type === 'order'
                    ? t('new_order_notification', { location: activeNotification.locationName })
                    : t('new_waiter_call_notification', { location: activeNotification.locationName })}
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                {activeNotification.message || (activeNotification.type === 'order'
                  ? t('new_order_notification_generic')
                  : t('new_waiter_call_notification_generic'))}
              </p>
              <Button className="w-full" onClick={handleAcknowledgeNotification}>
                {t('view_details')}
              </Button>
            </div>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-6 text-foreground">{viewTitles[activeView]}</h1>
        <div className="w-full">
          {activeView === 'settings' && (
            <>
              <SettingsPanel settings={settings} />
              <Card className="mt-8">
                <CardHeader><CardTitle>{t('test_notifications')}</CardTitle></CardHeader>
                <CardContent className="flex gap-4">
                  <Button onClick={handleTestWaiterCall}>{t('test_waiter_call_notification')}</Button>
                  <Button onClick={handleTestOrder}>{t('test_order_notification')}</Button>
                </CardContent>
              </Card>
            </>
          )}
          {activeView === 'categories' && <Card><CardContent className="p-6"><CategoryList /></CardContent></Card>}
          {activeView === 'menu-items' && <Card><CardContent className="p-6"><MenuItemList /></CardContent></Card>}
          {activeView === 'customer-club' && <Card><CardContent className="p-6"><CustomerClubList /></CardContent></Card>}
          {activeView === 'customer-club-report' && <Card><CardContent className="p-6"><CustomerClubReport /></CardContent></Card>}
          {activeView === 'locations' && <Card><CardContent className="p-6"><LocationManager /></CardContent></Card>}
          {activeView === 'waiter-calls' && <Card><CardContent className="p-6"><WaiterCallList /></CardContent></Card>}
          {activeView === 'orders' && <Card><CardContent className="p-6"><OrderList /></CardContent></Card>}
        </div>
      </main>
    </div>
  );
};

// --- Sidebar Navigation Component ---
interface SidebarNavProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activeView, setActiveView }) => {
  const { t } = useTranslation();
  const { settings } = useRestaurantSettings();
  const { tDynamic } = useDynamicTranslation();
  const { signOut } = useSession(); // Get signOut from useSession

  const navItems = [
    { id: 'settings', label: t('restaurant_settings'), icon: Settings },
    { id: 'categories', label: t('manage_categories'), icon: LayoutGrid },
    { id: 'menu-items', label: t('manage_menu_items'), icon: ClipboardList },
    { id: 'customer-club', label: t('customer_club'), icon: Users },
    { id: 'customer-club-report', label: t('customer_club_report'), icon: BarChart },
    { id: 'locations', label: t('manage_locations'), icon: Map },
    { id: 'waiter-calls', label: t('waiter_calls'), icon: BellRing },
    { id: 'orders', label: t('orders'), icon: ReceiptText },
  ];

  return (
    <aside className="w-64 bg-background border-l border-border flex flex-col p-4">
      <div className="flex items-center gap-3 mb-8">
        <img src={settings.logo_url} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
        <span className="text-lg font-semibold text-foreground">{tDynamic(settings.name)}</span>
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
  const [waiterCallSoundFile, setWaiterCallSoundFile] = useState<File | null>(null); // New state for sound file
  const [orderSoundFile, setOrderSoundFile] = useState<File | null>(null); // New state for sound file

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero' | 'waiter_sound' | 'order_sound') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'logo') {
        setLogoFile(file);
        setSettings((prev: any) => ({ ...prev, logo_url: URL.createObjectURL(file) }));
      } else if (type === 'hero') {
        setHeroBgFile(file);
        setSettings((prev: any) => ({ ...prev, hero_background_image_url: URL.createObjectURL(file) }));
      } else if (type === 'waiter_sound') {
        setWaiterCallSoundFile(file);
        setSettings((prev: any) => ({ ...prev, waiter_call_sound_url: URL.createObjectURL(file) }));
      } else if (type === 'order_sound') {
        setOrderSoundFile(file);
        setSettings((prev: any) => ({ ...prev, order_sound_url: URL.createObjectURL(file) }));
      }
    }
  };

  const handlePlaySound = (url: string) => {
    if (url) {
      new Audio(url).play().catch(e => console.error("Error playing sound:", e));
    } else {
      toast.error(t('no_sound_file_uploaded'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLogoUrl = settings.logo_url;
    let finalHeroBgUrl = settings.hero_background_image_url;
    let finalWaiterCallSoundUrl = settings.waiter_call_sound_url;
    let finalOrderSoundUrl = settings.order_sound_url;

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
    if (waiterCallSoundFile) {
      const uploadedUrl = await uploadFile(waiterCallSoundFile, 'notification-sounds');
      if (uploadedUrl) finalWaiterCallSoundUrl = uploadedUrl;
    }
    if (orderSoundFile) {
      const uploadedUrl = await uploadFile(orderSoundFile, 'notification-sounds');
      if (uploadedUrl) finalOrderSoundUrl = uploadedUrl;
    }

    await updateSettings({ 
      ...settings, 
      logo_url: finalLogoUrl, 
      hero_background_image_url: finalHeroBgUrl,
      waiter_call_sound_url: finalWaiterCallSoundUrl,
      order_sound_url: finalOrderSoundUrl,
    });
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
        <CardHeader><CardTitle>{t("notification_sounds")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="waiter_call_sound_url">{t("waiter_call_sound")}</Label>
            <div className="flex items-center gap-2">
              <Input id="waiter_call_sound_url" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'waiter_sound')} disabled={isLoading} />
              <Button type="button" variant="outline" size="icon" onClick={() => handlePlaySound(settings.waiter_call_sound_url)} disabled={!settings.waiter_call_sound_url}>
                <Play className="h-4 w-4" />
              </Button>
            </div>
            {settings.waiter_call_sound_url && <p className="text-sm text-muted-foreground mt-1">{t('current_sound')}: {settings.waiter_call_sound_url.split('/').pop()}</p>}
          </div>
          <div>
            <Label htmlFor="order_sound_url">{t("order_sound")}</Label>
            <div className="flex items-center gap-2">
              <Input id="order_sound_url" type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'order_sound')} disabled={isLoading} />
              <Button type="button" variant="outline" size="icon" onClick={() => handlePlaySound(settings.order_sound_url)} disabled={!settings.order_sound_url}>
                <Play className="h-4 w-4" />
              </Button>
            </div>
            {settings.order_sound_url && <p className="text-sm text-muted-foreground mt-1">{t('current_sound')}: {settings.order_sound_url.split('/').pop()}</p>}
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
