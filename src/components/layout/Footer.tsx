import React from "react";
import { useTranslation } from "react-i18next";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { MapPin, Phone, Clock, Twitter, Instagram, Facebook } from "lucide-react";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { settings, loading } = useRestaurantSettings();

  if (loading) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          
          {/* Contact Us Section */}
          <div className="space-y-3 flex flex-col items-center md:items-end">
            <h3 className="text-xl font-bold text-primary mb-2">{t("contact_us")}</h3>
            
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 w-full text-right">
              <div className="p-2 bg-primary/20 rounded-full">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">{tDynamic(settings.address)}</p>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 w-full text-right">
              <div className="p-2 bg-primary/20 rounded-full">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">{settings.phone_number}</p>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 w-full text-right">
              <div className="p-2 bg-primary/20 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm">{tDynamic(settings.working_hours_text)}</p>
            </div>
          </div>

          {/* About Us Section */}
          <div className="space-y-3 text-center">
            <h3 className="text-xl font-bold text-primary mb-2">{t("about_us")}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{tDynamic(settings.about_us_text)}</p>
          </div>

          {/* Follow Us Section */}
          <div className="space-y-3 flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold text-primary mb-2">{t("follow_us")}</h3>
            <div className="flex justify-center md:justify-start space-x-3 rtl:space-x-reverse">
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">{tDynamic(settings.copyright_text)}</p>
          <div className="mt-4 md:mt-0">
            <MadeWithDyad />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;