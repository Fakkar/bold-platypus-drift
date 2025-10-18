import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { toast } from 'sonner'; // For notifications

interface RestaurantSettings {
  id?: string; // Supabase ID for the settings row
  name: string;
  logo_url: string;
  slogan: string;
  phone_number: string;
  working_hours_text: string;
  hero_title: string;
  hero_description: string;
  hero_background_image_url: string;
  // New footer fields
  about_us_text: string;
  address: string;
  twitter_url: string;
  instagram_url: string;
  facebook_url: string;
  copyright_text: string;
}

interface RestaurantSettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => Promise<void>;
  loading: boolean;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextType | undefined>(undefined);

export const RestaurantSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "My Restaurant",
    logo_url: "/public/placeholder.svg",
    slogan: "Taste the difference, experience the unforgettable",
    phone_number: "021-1234-5678",
    working_hours_text: "9:00 AM - 11:00 PM",
    hero_title: "Online Menu",
    hero_description: "Enjoy our delicious food. All dishes are prepared with the best ingredients and a passion for cooking.",
    hero_background_image_url: "/public/hero-bg.jpg",
    // Default footer values
    about_us_text: 'ما با بیش از ۱۰ سال تجربه در صنعت آشپزی، بهترین غذاهای محلی و بین‌المللی را برای شما آماده می‌کنیم. / With over 10 years of experience in the culinary industry, we prepare the best local and international dishes for you.',
    address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳ / Tehran, Vali-e Asr St., No. 123',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    copyright_text: '© 2024 رستوران. تمامی حقوق محفوظ است.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching restaurant settings:', error);
        toast.error('Failed to load restaurant settings.');
      } else if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<RestaurantSettings>) => {
    setLoading(true);
    const updatedData = { ...settings, ...newSettings, updated_at: new Date().toISOString() };

    let resultData = null;
    let error = null;

    if (settings.id) {
      const { data, error: updateError } = await supabase
        .from('restaurant_settings')
        .update(updatedData)
        .eq('id', settings.id)
        .select()
        .single();
      resultData = data;
      error = updateError;
    } else {
      const { id, ...insertData } = updatedData;
      const { data, error: insertError } = await supabase
        .from('restaurant_settings')
        .insert(insertData)
        .select()
        .single();
      resultData = data;
      error = insertError;
    }

    if (error) {
      console.error('Error saving restaurant settings:', error);
      toast.error('Failed to save settings.');
    } else if (resultData) {
      setSettings(prev => ({ ...prev, ...resultData }));
      toast.success('Settings saved successfully!');
    }
    setLoading(false);
  };

  return (
    <RestaurantSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </RestaurantSettingsContext.Provider>
  );
};

export const useRestaurantSettings = () => {
  const context = useContext(RestaurantSettingsContext);
  if (context === undefined) {
    throw new Error('useRestaurantSettings must be used within a RestaurantSettingsProvider');
  }
  return context;
};