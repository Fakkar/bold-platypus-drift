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
    const updatedData = { ...settings, ...newSettings, updated_at: new Date().toISOString() };

    let resultData = null;
    let error = null;

    if (settings.id) {
      // If settings already exist, update them
      const { data, error: updateError } = await supabase
        .from('restaurant_settings')
        .update(updatedData)
        .eq('id', settings.id)
        .select()
        .single();
      resultData = data;
      error = updateError;
    } else {
      // If no settings exist, insert a new row
      // Remove 'id' from updatedData for insert, as it's auto-generated
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
      setSettings({
        id: resultData.id,
        name: resultData.name,
        logo_url: resultData.logo_url,
        slogan: resultData.slogan,
        phone_number: resultData.phone_number,
        working_hours_text: resultData.working_hours_text,
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