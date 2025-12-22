import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPriceInToman, toPersianNumber } from '@/utils/format';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';
import { useTableLocation } from '@/context/TableLocationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CartSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { cartItems, removeFromCart, updateQuantity, totalItems, totalAmount, clearCart } = useCart();
  const { tableId } = useTableLocation();
  const [isOrdering, setIsOrdering] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error(t('empty_cart'));
      return;
    }
    if (!tableId) {
      toast.error(t('cannot_place_order_no_location'));
      return;
    }

    setIsOrdering(true);
    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          location_id: tableId,
          total_amount: totalAmount,
          status: 'new',
        })
        .select()
        .single();

      if (orderError) {
        throw orderError;
      }

      // 2. Add order items
      const orderItemsPayload = cartItems.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.selectedVariation ? item.selectedVariation.price : item.price,
        variations: item.selectedVariation ? { name: item.selectedVariation.name, price: item.selectedVariation.price } : null,
        notes: item.notes,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (orderItemsError) {
        throw orderItemsError;
      }

      toast.success(t('order_placed_successfully'));
      clearCart();
      onOpenChange(false); // Close the sidebar
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(t('failed_to_place_order', { message: error.message }));
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col rtl:text-right" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{t('your_cart')}</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="flex-1 pr-4 -ml-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('empty_cart')}</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md bg-card">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={tDynamic(item.name)} className="h-16 w-16 object-cover rounded-md" />
                  )}
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-foreground">{tDynamic(item.name)}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-muted-foreground">
                        {tDynamic(item.selectedVariation.name)}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {t('notes')}: {item.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-primary" dir="rtl">
                        {formatPriceInToman(item.selectedVariation?.price || item.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{toPersianNumber(item.quantity)}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <SheetFooter className="flex flex-col gap-2 p-4 border-t border-border">
          <div className="flex justify-between text-lg font-semibold text-foreground">
            <span>{t('total_items')}:</span>
            <span>{toPersianNumber(totalItems)}</span>
          </div>
          {/* Removed total amount display */}
          <Button
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0 || isOrdering || !tableId}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isOrdering ? t('confirming_order') : t('confirm_order')}
          </Button>
          {!tableId && (
            <p className="text-sm text-destructive text-center mt-2">{t('cannot_place_order_no_location')}</p>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;