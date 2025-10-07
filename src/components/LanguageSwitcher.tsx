import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Set text direction based on language
    document.documentElement.dir = (lng === "fa" || lng === "ar") ? "rtl" : "ltr";
  };

  React.useEffect(() => {
    // Set initial text direction based on current language
    document.documentElement.dir = (i18n.language === "fa" || i18n.language === "ar") ? "rtl" : "ltr";
  }, [i18n.language]);

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("select_language")}
      </label>
      <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
        <SelectTrigger id="language-select" className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fa">
            <span role="img" aria-label="Farsi flag" className="mr-2">🇮🇷</span> فارسی
          </SelectItem>
          <SelectItem value="en">
            <span role="img" aria-label="English flag" className="mr-2">🇬🇧</span> English
          </SelectItem>
          <SelectItem value="ar">
            <span role="img" aria-label="Arabic flag" className="mr-2">🇸🇦</span> العربية
          </SelectItem>
          <SelectItem value="zh">
            <span role="img" aria-label="Chinese flag" className="mr-2">🇨🇳</span> 中文
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;