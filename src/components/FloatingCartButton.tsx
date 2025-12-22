import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toPersianNumber } from '@/utils/format';

interface FloatingCartButtonProps {
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();
  const { totalItems } = useCart();

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-40 rounded-full p-4 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2 rtl:space-x-reverse"
    >
      <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
      <span className="hidden md:inline-block text-lg">{t('your_cart')}</span>
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-600 text-white rounded-full h-6 w-6 md:h-8 md:w-8 flex items-center justify-center text-xs md:text-sm font-bold">
          {toPersianNumber(totalItems)}
        </span>
      )}
    </Button>
  );
};

export default FloatingCartButton;