import React from "react";
import { useTranslation } from "react-i18next";
import { ChefHat, Award, Users, Star } from "lucide-react"; // Import necessary icons
import StatisticCard from "./StatisticCard"; // Import the new StatisticCard component

const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative bg-gradient-to-br from-purple-800 to-indigo-900 h-[600px] flex flex-col items-center justify-center text-white p-4"
    >
      <div className="relative z-10 text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="bg-primary p-4 rounded-full shadow-lg">
            <ChefHat className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          {t("hero_title_new")}
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          {t("hero_description_new")}
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