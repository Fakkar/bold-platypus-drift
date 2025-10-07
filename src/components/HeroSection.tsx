import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-white"
      style={{ backgroundImage: "url('/public/hero-bg.jpg')" }} // Placeholder image
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-center p-4 max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          {t("hero_title")}
        </h1>
        <p className="text-xl mb-8">
          {t("hero_description")}
        </p>
        <Link to="/menu#menu-items">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t("view_menu")}
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;