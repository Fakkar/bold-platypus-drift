import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WorkingHours: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground py-4">
        <CardTitle className="text-2xl font-bold text-center">{t("working_hours")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-gray-800 dark:text-gray-200">
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <span className="font-medium">{t("monday_friday")}</span>
          <span>9:00 AM - 10:00 PM</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <span className="font-medium">{t("saturday_sunday")}</span>
          <span>10:00 AM - 11:00 PM</span>
        </div>
        <div className="flex justify-between items-center py-2 last:border-b-0">
          <span className="font-medium">{t("holidays")}</span>
          <span className="text-destructive">{t("closed")}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkingHours;