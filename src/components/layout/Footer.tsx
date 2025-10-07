import React from "react";
import { useTranslation } from "react-i18next";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4">
          &copy; {new Date().getFullYear()} {t("restaurant_name")}. {t("all_rights_reserved")}.
        </p>
        <div className="flex justify-center space-x-4 mb-4">
          <a href="#" className="hover:text-white transition-colors">{t("privacy_policy")}</a>
          <a href="#" className="hover:text-white transition-colors">{t("terms_of_service")}</a>
        </div>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;