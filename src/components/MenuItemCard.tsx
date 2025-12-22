import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format';
import ImageModal from './ImageModal';
import { cn } from "@/lib/utils";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";
import DescriptionDialog from './DescriptionDialog';
import { Button } from "@/components/ui/button"; // Import Button
import { ShoppingCart } from "lucide-react"; // Import ShoppingCart icon
import { useCart } from "@/context/CartContext"; // Import useCart hook
import { toast } from 'sonner'; // Import toast

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available: boolean;
  };
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { addToCart } = useCart(); // Use the addToCart function
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (url: string) => {
    if (!item.is_available) return;
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!item.is_available) {
      toast.error(t('out_of_stock'));
      return;
    }
    addToCart({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.image_url,
    });
  };

  const currentName = tDynamic(item.name);
  const currentDescription = tDynamic(item.description);
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
        <CardContent className="text-right">
          <p className="text-gray-300 text-sm mb-2 line-clamp-2">
            {currentDescription}
          </p>
          {shouldShowMore && (
            <div className="mb-4 flex justify-end">
              <DescriptionDialog
                title={currentName}
                description={currentDescription}
                triggerLabel="مشاهده کامل"
              />
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <Button 
              onClick={handleAddToCart} 
              disabled={!item.is_available}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <ShoppingCart className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
              {t('order_button')}
            </Button>
            <span className="text-2xl font-bold text-primary" dir="rtl">
              {formatPriceInToman(item.price)}
            </span>
          </div>
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

export default MenuItemCard;