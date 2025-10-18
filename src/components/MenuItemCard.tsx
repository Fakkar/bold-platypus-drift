import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format';
import ImageModal from './ImageModal'; // Import the new ImageModal component

interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  };
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-purple-800/50 text-white"> {/* Added custom background and text color */}
        <div 
          className="w-full aspect-square overflow-hidden cursor-pointer" 
          onClick={() => handleImageClick(item.image_url || '/public/placeholder.svg')}
        >
          <img 
            src={item.image_url || '/public/placeholder.svg'} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
        <CardHeader className="text-right">
          <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-right">
          <p className="text-gray-300 text-sm mb-4 line-clamp-2"> {/* Adjusted text color */}
            {item.description}
          </p>
          <div className="flex items-center justify-start">
            <span className="text-2xl font-bold text-primary" dir="rtl"> {/* Primary color for price */}
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
          altText={item.name}
        />
      )}
    </>
  );
};

export default MenuItemCard;