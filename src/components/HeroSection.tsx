import React from "react";
import { useTranslation } from "react-i18next";
import { ChefHat, Award, Users, Star } from "lucide-react";
import StatisticCard from "./StatisticCard";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext"; // Import useRestaurantSettings

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading: settingsLoading } = useRestaurantSettings();

  if (settingsLoading) {
    return null; // Or a loading spinner
  }

  return (
    <section
      className="relative h-[500px] md:h-[600px] flex flex-col items-center justify-center text-white p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${settings.hero_background_image_url})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 z-0"></div> {/* Overlay for gradient */}
      <div className="relative z-10 text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="bg-primary p-4 rounded-full shadow-lg animate-float"> {/* Added animate-float class */}
            <ChefHat className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          {settings.hero_title}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          {settings.hero_description}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <StatisticCard icon={Award} value="+10" label="years_experience" />
          <StatisticCard icon={Users} value="+1000" label="customers_served" />
          <StatisticCard icon={Star} value="4.9" label="rating" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;