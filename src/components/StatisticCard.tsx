import React from "react";
import { useTranslation } from "react-i18next";
import { LucideIcon } from "lucide-react";

interface StatisticCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ icon: Icon, value, label }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center space-y-1 md:space-y-2 flex flex-col items-center justify-center min-w-[100px] md:min-w-[120px]">
      <Icon className="h-6 w-6 md:h-8 md:h-8 text-primary" />
      <p className="text-xl md:text-2xl font-bold text-white">{value}</p>
      <p className="text-xs md:text-sm text-gray-300">{t(label)}</p>
    </div>
  );
};

export default StatisticCard;