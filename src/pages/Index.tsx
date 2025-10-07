import { MadeWithDyad } from "@/components/made-with-dyad";
import LanguageSwitcher from "@/components/LanguageSwitcher"; // Import LanguageSwitcher
import { useTranslation } from "react-i18next"; // Import useTranslation
import { Link } from "react-router-dom"; // Import Link for navigation
import { Button } from "@/components/ui/button"; // Import Button component

const Index = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t("start_building")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/menu">
            <Button size="lg" className="w-full sm:w-auto">
              {t("menu")}
            </Button>
          </Link>
          <Link to="/admin">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              {t("admin_dashboard")}
            </Button>
          </Link>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;