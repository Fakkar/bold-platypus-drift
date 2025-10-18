import React from "react";
import { useTranslation } from "react-i18next";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { MapPin, Phone, Clock, Twitter, Instagram, Facebook } from "lucide-react";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading } = useRestaurantSettings();

  if (loading) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
          
          {/* Contact Us Section */}
          <div className="space-y-4 flex flex-col items-center md:items-end">
            <h3 className="text-2xl font-bold text-primary mb-4">{t("contact_us")}</h3>
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <p>{settings.address}</p>
              <div className="p-2 bg-primary/20 rounded-full">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <p>{settings.phone_number}</p>
              <div className="p-2 bg-primary/20 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <p>{settings.working_hours_text}</p>
              <div className="p-2 bg-primary/20 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">{t("about_us")}</h3>
            <p className="text-gray-400 leading-relaxed">{settings.about_us_text}</p>
          </div>

          {/* Follow Us Section */}
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-bold text-primary mb-4">{t("follow_us")}</h3>
            <div className="flex flex-col space-y-4">
              <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-lg hover:bg-primary transition-colors inline-flex">
                <Twitter className="h-6 w-6" />
              </a>
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-lg hover:bg-primary transition-colors inline-flex">
                <Instagram className="h-6 w-6" />
              </a>
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 rounded-lg hover:bg-primary transition-colors inline-flex">
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">{settings.copyright_text}</p>
          <div className="mt-4 md:mt-0">
            <MadeWithDyad />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;