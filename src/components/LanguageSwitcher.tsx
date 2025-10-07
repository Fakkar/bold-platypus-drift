import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react"; // Import Globe icon

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = (lng === "fa" || lng === "ar") ? "rtl" : "ltr";
  };

  React.useEffect(() => {
    document.documentElement.dir = (i18n.language === "fa" || i18n.language === "ar") ? "rtl" : "ltr";
  }, [i18n.language]);

  const getFlag = (lng: string) => {
    switch (lng) {
      case "fa":
        return "🇮🇷";
      case "en":
        return "🇬🇧";
      case "ar":
        return "🇸🇦";
      case "zh":
        return "🇨🇳";
      default:
        return "";
    }
  };

  return (
    <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
      <SelectTrigger 
        id="language-select" 
        className="w-[100px] bg-transparent text-white border border-white/30 hover:border-white/50 focus:ring-0 focus:ring-offset-0 rounded-md px-3 py-2 flex items-center justify-center space-x-1"
      >
        <span role="img" aria-label="flag" className="text-lg">{getFlag(i18n.language)}</span>
        <Globe className="h-4 w-4 text-white" />
      </SelectTrigger>
      <SelectContent className="bg-gray-800 text-white border-gray-700">
        <SelectItem value="fa" className="flex items-center">
          <span role="img" aria-label="Farsi flag" className="mr-2">🇮🇷</span> فارسی
        </SelectItem>
        <SelectItem value="en" className="flex items-center">
          <span role="img" aria-label="English flag" className="mr-2">🇬🇧</span> English
        </SelectItem>
        <SelectItem value="ar" className="flex items-center">
          <span role="img" aria-label="Arabic flag" className="mr-2">🇸🇦</span> العربية
        </SelectItem>
        <SelectItem value="zh" className="flex items-center">
          <span role="img" aria-label="Chinese flag" className="mr-2">🇨🇳</span> 中文
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;