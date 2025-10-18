import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import hafezData from '@/data/hafez.json';

const HafezDivination: React.FC = () => {
  const { t } = useTranslation();
  const [divination, setDivination] = useState<{ poem: string; interpretation: string } | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * hafezData.length);
    setDivination(hafezData[randomIndex]);
  }, []);

  if (!divination) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8" dir="rtl">
      <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-sm text-white border-primary/50 shadow-lg animate-pulse-shadow">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-primary">{t('your_divination')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <blockquote className="text-lg leading-loose whitespace-pre-line border-r-4 border-primary pr-4 italic">
            {divination.poem}
          </blockquote>
          <Separator className="bg-primary/50" />
          <p className="text-gray-300 leading-relaxed">
            {divination.interpretation}
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default HafezDivination;