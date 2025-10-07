import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format'; // Import the formatting utility

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string; // Changed from imageUrl to image_url to match Supabase data
  };
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={item.image_url || '/public/placeholder.svg'} alt={item.name} className="w-full h-48 object-cover" />
      <CardHeader className="text-right"> {/* Align header text to the right */}
        <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-right"> {/* Align content text to the right */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-center"> {/* Center the price */}
          <span className="text-2xl font-bold text-primary dark:text-primary-foreground" dir="rtl"> {/* Explicitly set direction to RTL */}
            {formatPriceInToman(item.price)} {/* Format price in Toman and Persian */}
          </span>
          {/* Removed "Add to Cart" button */}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;