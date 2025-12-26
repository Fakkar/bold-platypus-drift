import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantSettings {
  id?: string;
  name: string;
  slogan: string;
  logo_url: string;
  hero_title: string;
  hero_description: string;
  hero_background_image_url: string;
  address: string;
  phone_number: string;
  working_hours_text: string;
  about_us_text: string;
  copyright_text: string;
  twitter_url: string;
  instagram_url: string;
  facebook_url: string;
  waiter_call_sound_url: string;
  order_sound_url: string;
  [key: string]: any; // Allow additional properties
}

interface RestaurantSettingsContextType {
  settings: RestaurantSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => Promise<void>;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextType | undefined>(undefined);

export const RestaurantSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: 'Restaurant Name',
    slogan: 'Restaurant Slogan',
    logo_url: '/public/placeholder.svg',
    hero_title: 'Hero Title',
    hero_description: 'Hero Description',
    hero_background_image_url: '/public/hero-bg.jpg',
    address: 'Restaurant Address',
    phone_number: '021-1234-5678',
    working_hours_text: 'Working Hours',
    about_us_text: 'About Us Text',
    copyright_text: 'All rights reserved.',
    twitter_url: 'https://twitter.com',
    instagram_url: 'https://instagram.com',
    facebook_url: 'https://facebook.com',
    waiter_call_sound_url: '/public/sounds/notification.mp3',
    order_sound_url: '/public/sounds/order-notification.mp3',
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
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update(newSettings)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant settings:', error);
      toast.error('Failed to update restaurant settings.');
    } else {
      setSettings(prev => ({ ...prev, ...data }));
      toast.success('Settings updated successfully!');
    }
    setLoading(false);
  };

  return (
    <RestaurantSettingsContext.Provider value={{ settings, loading, updateSettings }}>
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