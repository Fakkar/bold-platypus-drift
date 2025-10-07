import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurantSettings } from "@/context/RestaurantSettingsContext";

const WorkingHours: React.FC = () => {
  const { t } = useTranslation();
  const { settings, loading } = useRestaurantSettings();

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground py-4">
        <CardTitle className="text-2xl font-bold text-center">{t("working_hours")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-gray-800 dark:text-gray-200 text-center">
        <p className="text-lg font-medium">{settings.working_hours_text}</p>
      </CardContent>
    </Card>
  );
};

export default WorkingHours;