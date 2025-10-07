import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary dark:text-primary-foreground">
            ${item.price.toFixed(2)}
          </span>
          {/* Removed "Add to Cart" button */}
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;