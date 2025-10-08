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
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center space-y-2 flex flex-col items-center justify-center min-w-[120px] flex-1">
      <Icon className="h-8 w-8 text-primary" />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-300">{t(label)}</p>
    </div>
  );
};

export default StatisticCard;