import React from "react";
import { useTranslation } from "react-i18next";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom"; // Import Link
import { Settings } from "lucide-react"; // Import an icon

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 py-8 mt-12 relative">
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
      <div className="absolute bottom-4 left-4">
        <Link to="/admin" className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
          <Settings className="h-6 w-6" />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;