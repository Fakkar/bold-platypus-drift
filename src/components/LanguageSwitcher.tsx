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
      <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
        <SelectTrigger id="language-select" className="w-[100px] border-none focus:ring-0 focus:ring-offset-0 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fa">فارسی</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
          <SelectItem value="zh">中文</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;