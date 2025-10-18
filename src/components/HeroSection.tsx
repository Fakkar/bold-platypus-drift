import React from "react";
import { useTranslation } from "react-i18next";
import { ChefHat, Award, Users, Star } from "lucide-react";
import StatisticCard from "./StatisticCard";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { settings, loading: settingsLoading } = useRestaurantSettings();

  if (settingsLoading) {
    return null; // Or a loading spinner
  }

  return (
    <section
      className="relative min-h-[550px] md:h-[600px] flex flex-col items-center justify-center text-white p-4 pt-28 bg-cover bg-center"
      style={{ backgroundImage: `url(${settings.hero_background_image_url})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800/70 to-indigo-900/70 z-0"></div> {/* Overlay for gradient */}
      <div className="relative z-10 text-center space-y-4 md:space-y-6">
        <div className="flex justify-center mb-4">
          <div className="bg-primary p-3 md:p-4 rounded-full shadow-lg animate-float">
            <ChefHat className="h-10 w-10 md:h-12 md:w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          {tDynamic(settings.hero_title)}
        </h1>
        <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl">
          {tDynamic(settings.hero_description)}
        </p>
        
        <div className="flex flex-row items-stretch justify-center gap-2 md:gap-4 mt-6 md:mt-8">
          <StatisticCard icon={Award} value="+10" label="years_experience" />
          <StatisticCard icon={Users} value="+1000" label="customers_served" />
          <StatisticCard icon={Star} value="4.9" label="rating" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;