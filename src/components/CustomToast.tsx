import React from 'react';
import { CheckCircle, BellRing, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CustomToastProps {
  type: 'order' | 'waiter';
  location?: string;
  message?: string;
}

const CustomToast: React.FC<CustomToastProps> = ({ type, location, message }) => {
  const { t } = useTranslation();

  const icon = type === 'order' ? <UtensilsCrossed className="h-6 w-6" /> : <BellRing className="h-6 w-6" />;
  const title = type === 'order' ? t('new_order_notification', { location }) : t('new_waiter_call_notification', { location });
  const description = message || (type === 'order' ? t('new_order_notification_generic') : t('new_waiter_call_notification_generic'));
  const bgColor = type === 'order' ? 'bg-green-600' : 'bg-blue-600';

  return (
    <div className={cn("flex items-center p-4 rounded-md shadow-lg text-white", bgColor)}>
      <div className="mr-3 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  );
};

export default CustomToast;