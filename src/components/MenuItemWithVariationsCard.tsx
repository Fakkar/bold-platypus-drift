import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { formatPriceInToman } from '@/utils/format';
import { cn } from "@/lib/utils";
import { useDynamicTranslation } from "@/context/DynamicTranslationContext";
import { Separator } from './ui/separator';
import ImageModal from './ImageModal';
import DescriptionDialog from './DescriptionDialog';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox"; // Changed from RadioGroup to Checkbox
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Input } from "@/components/ui/input";

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
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isAddToCartDialogOpen, setIsAddToCartDialogOpen] = useState(false);
  const [selectedVariationsQuantities, setSelectedVariationsQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  const handleImageClick = (url: string) => {
    if (!item.is_available) return;
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const handleOpenAddToCartDialog = () => {
    if (!item.is_available) {
      toast.error(t('out_of_stock'));
      return;
    }
    // Reset quantities and notes when opening the dialog
    const initialQuantities: Record<string, number> = {};
    item.variations.forEach(v => {
      if (v.is_available !== false) {
        initialQuantities[v.name] = 0; // Initialize to 0, not 1, for checkboxes
      }
    });
    setSelectedVariationsQuantities(initialQuantities);
    setNotes('');
    setIsAddToCartDialogOpen(true);
  };

  const handleVariationQuantityChange = (variationName: string, newQuantity: number) => {
    setSelectedVariationsQuantities(prev => ({
      ...prev,
      [variationName]: Math.max(0, newQuantity), // Ensure quantity is not negative
    }));
  };

  const handleAddToCart = () => {
    const itemsToAdd = [];
    let hasSelectedAny = false;

    for (const variation of item.variations) {
      const quantity = selectedVariationsQuantities[variation.name] || 0;
      if (quantity > 0) {
        if (variation.is_available === false) {
          toast.error(t('variation_out_of_stock'));
          return; // Prevent adding out-of-stock variations
        }
        itemsToAdd.push({
          menuItemId: item.id,
          name: item.name,
          price: variation.price,
          quantity,
          imageUrl: item.image_url,
          selectedVariation: { name: variation.name, price: variation.price },
          notes: notes.trim() || undefined,
        });
        hasSelectedAny = true;
      }
    }

    if (!hasSelectedAny) {
      toast.error(t('select_at_least_one_variation_quantity'));
      return;
    }

    itemsToAdd.forEach(cartItem => addToCart(cartItem));
    setIsAddToCartDialogOpen(false);
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
          <div className="flex justify-center mt-4">
            <Button 
              onClick={handleOpenAddToCartDialog} 
              disabled={!item.is_available}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
            >
              <ShoppingCart className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
              {t('add_to_cart_button')}
            </Button>
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

      <Dialog open={isAddToCartDialogOpen} onOpenChange={setIsAddToCartDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rtl:text-right">
          <DialogHeader>
            <DialogTitle>{t('add_to_cart')}: {currentName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {item.variations.length > 0 && (
              <div className="space-y-3">
                <Label>{t('select_variation')}</Label>
                {item.variations.map((variation) => (
                  <div key={variation.name} className={cn(
                    "flex items-center gap-2",
                    variation.is_available === false && "opacity-50"
                  )}>
                    <Checkbox
                      id={`variation-${variation.name}`}
                      checked={(selectedVariationsQuantities[variation.name] || 0) > 0}
                      onCheckedChange={(checked) => {
                        handleVariationQuantityChange(variation.name, checked ? 1 : 0);
                      }}
                      disabled={variation.is_available === false}
                    />
                    <Label
                      htmlFor={`variation-${variation.name}`}
                      className={cn("flex-grow cursor-pointer", variation.is_available === false && "line-through text-muted-foreground")}
                    >
                      {tDynamic(variation.name)} ({formatPriceInToman(variation.price)})
                    </Label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleVariationQuantityChange(variation.name, (selectedVariationsQuantities[variation.name] || 0) - 1)}
                        disabled={variation.is_available === false || (selectedVariationsQuantities[variation.name] || 0) <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={selectedVariationsQuantities[variation.name] || 0}
                        onChange={(e) => handleVariationQuantityChange(variation.name, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min="0"
                        disabled={variation.is_available === false}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleVariationQuantityChange(variation.name, (selectedVariationsQuantities[variation.name] || 0) + 1)}
                        disabled={variation.is_available === false}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">{t('add_notes')}</Label>
              <Textarea 
                id="notes" 
                placeholder={t('order_notes_placeholder')} 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button onClick={handleAddToCart} disabled={!item.is_available || Object.values(selectedVariationsQuantities).every(q => q === 0)}>
              {t('add_to_cart_button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemWithVariationsCard;