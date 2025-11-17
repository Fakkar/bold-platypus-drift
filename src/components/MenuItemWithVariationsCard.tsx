import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format';
import { cn } from "@/lib/utils";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";
import { Separator } from './ui/separator';
import ImageModal from './ImageModal';
import DescriptionDialog from './DescriptionDialog';

interface Variation {
  name: string;
  price: number;
  is_available?: boolean;
}

interface MenuItemWithVariations {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  variations: Variation[];
  is_available: boolean;
}

interface MenuItemWithVariationsCardProps {
  item: MenuItemWithVariations;
}

const MenuItemWithVariationsCard: React.FC<MenuItemWithVariationsCardProps> = ({ item }) => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (url: string) => {
    if (!item.is_available) return;
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const currentName = tDynamic(item.name);
  const currentDescription = item.description ? tDynamic(item.description) : undefined;
  const shouldShowMore = !!currentDescription && currentDescription.length > 100;

  return (
    <>
      <Card className={cn(
        "w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-purple-800/50 text-white relative",
        !item.is_available && "grayscale opacity-60"
      )}>
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-lg">
            <span className="text-white text-xl font-bold bg-destructive px-4 py-2 rounded-md -rotate-12">
              {t('out_of_stock')}
            </span>
          </div>
        )}
        <div 
          className={cn("w-full aspect-square overflow-hidden", item.is_available && "cursor-pointer")}
          onClick={() => handleImageClick(item.image_url || '/public/placeholder.svg')}
        >
          <img 
            src={item.image_url || '/public/placeholder.svg'} 
            alt={currentName} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
        <CardHeader className="text-right">
          <CardTitle className="text-xl font-semibold">{currentName}</CardTitle>
        </CardHeader>
        <CardContent className="text-right space-y-2">
          {item.description && (
            <>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {currentDescription}
              </p>
              {shouldShowMore && (
                <div className="mb-2 flex justify-end">
                  <DescriptionDialog
                    title={currentName}
                    description={currentDescription!}
                    triggerLabel="مشاهده کامل"
                  />
                </div>
              )}
            </>
          )}
          {item.variations.map((variation, index) => (
            <React.Fragment key={index}>
              <div className={cn(
                "flex justify-between items-center",
                variation.is_available === false && "opacity-50"
              )}>
                <span className={cn("text-gray-300 text-sm", variation.is_available === false && "line-through")}>
                  {tDynamic(variation.name)}
                </span>
                <span className={cn("text-lg font-bold text-primary", variation.is_available === false && "line-through")} dir="rtl">
                  {formatPriceInToman(variation.price)}
                </span>
              </div>
              {index < item.variations.length - 1 && <Separator className="bg-white/20" />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>

      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imageUrl={selectedImage}
          altText={currentName}
        />
      )}
    </>
  );
};

export default MenuItemWithVariationsCard;