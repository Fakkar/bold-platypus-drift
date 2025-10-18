import React from 'react';
import { useTranslation } from 'react-i18next';
import MenuItemCard from './MenuItemCard';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

interface FeaturedItemsProps {
  items: MenuItem[];
}

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ items }) => {
  const { t } = useTranslation();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12" dir="rtl">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">{t('chefs_special')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {items.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedItems;