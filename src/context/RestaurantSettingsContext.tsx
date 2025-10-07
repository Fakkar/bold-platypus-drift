import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { toast } from 'sonner'; // For notifications

interface RestaurantSettings {
  id?: string; // Supabase ID for the settings row
  name: string;
  logo_url: string; // Changed to logo_url to match Supabase column name
  slogan: string; // New field for restaurant slogan
  phone_number: string; // New field for phone number
  working_hours_text: string; // New field for working hours text
}

interface RestaurantSettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => Promise<void>;
  loading: boolean;
}

const RestaurantSettingsContext = createContext<RestaurantSettingsContextType | undefined>(undefined);

export const RestaurantSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "My Restaurant", // Default name
    logo_url: "/public/placeholder.svg", // Default logo
    slogan: "Taste the difference, experience the unforgettable", // Default slogan
    phone_number: "021-1234-5678", // Default phone number
    working_hours_text: "9:00 AM - 11:00 PM", // Default working hours
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .single(); // Assuming only one row for global settings

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error('Error fetching restaurant settings:', error);
        toast.error('Failed to load restaurant settings.');
      } else if (data) {
        setSettings({
          id: data.id,
          name: data.name,
          logo_url: data.logo_url,
          slogan: data.slogan || "Taste the difference, experience the unforgettable",
          phone_number: data.phone_number || "021-1234-5678",
          working_hours_text: data.working_hours_text || "9:00 AM - 11:00 PM",
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<RestaurantSettings>) => {
    setLoading(true);
    const { id, ...settingsToUpdate } = { ...settings, ...newSettings };

    const { data, error } = await supabase
      .from('restaurant_settings')
      .upsert({ id, ...settingsToUpdate, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant settings:', error);
      toast.error('Failed to save settings.');
    } else if (data) {
      setSettings({
        id: data.id,
        name: data.name,
        logo_url: data.logo_url,
        slogan: data.slogan,
        phone_number: data.phone_number,
        working_hours_text: data.working_hours_text,
      });
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