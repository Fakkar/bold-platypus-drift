import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          {t("about")}
        </h1>
        <div className="max-w-3xl mx-auto text-lg text-gray-700 dark:text-gray-300 space-y-6">
          <p>
            {t("about_us_paragraph_1")}
          </p>
          <p>
            {t("about_us_paragraph_2")}
          </p>
          <p>
            {t("about_us_paragraph_3")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;