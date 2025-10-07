import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          {t("contact")}
        </h1>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <CardHeader>
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold">{t("email_us")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">info@restaurant.com</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardHeader>
              <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold">{t("call_us")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">+1 (123) 456-7890</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6">
            <CardHeader>
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-xl font-semibold">{t("find_us")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">123 Restaurant St, Food City</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;