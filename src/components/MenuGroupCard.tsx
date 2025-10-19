import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format';
import { cn } from "@/lib/utils";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";
import { Separator } from './ui/separator';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

interface MenuGroupCardProps {
  groupName: string;
  items: MenuItem[];
  imageUrl?: string;
}

const MenuGroupCard: React.FC<MenuGroupCardProps> = ({ groupName, items, imageUrl }) => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();

  const allItemsUnavailable = items.every(item => !item.is_available);

  return (
    <Card className={cn(
      "w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-purple-800/50 text-white relative",
      allItemsUnavailable && "grayscale opacity-60"
    )}>
      {allItemsUnavailable && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-lg">
          <span className="text-white text-xl font-bold bg-destructive px-4 py-2 rounded-md -rotate-12">
            {t('out_of_stock')}
          </span>
        </div>
      )}
      <div className="w-full aspect-square overflow-hidden">
        <img 
          src={imageUrl || '/public/placeholder.svg'} 
          alt={tDynamic(groupName)} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
        />
      </div>
      <CardHeader className="text-right">
        <CardTitle className="text-xl font-semibold">{tDynamic(groupName)}</CardTitle>
      </CardHeader>
      <CardContent className="text-right space-y-2">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <div className={cn(
              "flex justify-between items-center",
              !item.is_available && "opacity-50"
            )}>
              <span className="text-gray-300 text-sm">{tDynamic(item.name)}</span>
              <span className="text-lg font-bold text-primary" dir="rtl">
                {formatPriceInToman(item.price)}
              </span>
            </div>
            {!item.is_available && <p className="text-xs text-destructive text-left -mt-1">{t('out_of_stock')}</p>}
            {index < items.length - 1 && <Separator className="bg-white/20" />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default MenuGroupCard;