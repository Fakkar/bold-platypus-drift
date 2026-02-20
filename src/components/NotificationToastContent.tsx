import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BellRing, UtensilsCrossed, Eye, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastContentProps {
  type: 'order' | 'waiter';
  locationName: string;
  message?: string;
  toastId: string | number;
}

const NotificationToastContent: React.FC<NotificationToastContentProps> = ({ type, locationName, message, toastId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const title = type === 'order' ? t('new_order_notification', { location: locationName }) : t('new_waiter_call_notification', { location: locationName });
  const description = message || (type === 'order' ? t('new_order_notification_generic') : t('new_waiter_call_notification_generic'));
  const icon = type === 'order' ? <UtensilsCrossed className="h-8 w-8" /> : <BellRing className="h-8 w-8" />;
  
  const bgColor = type === 'order' ? 'bg-green-600' : 'bg-blue-600';

  const handleViewClick = () => {
    toast.dismiss(toastId);
    if (type === 'order') {
      navigate('/admin?view=orders');
    } else {
      navigate('/admin?view=waiter-calls');
    }
  };

  return (
    <div className={cn("flex items-start p-6 rounded-md shadow-lg text-white w-full max-w-sm md:max-w-md z-50", bgColor)}>
      <div className="ml-4 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-xl md:text-2xl">{title}</p>
        <p className="text-base md:text-lg mt-1">{description}</p>
        <div className="flex gap-2 mt-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleViewClick}
            className="bg-white/20 hover:bg-white/30 text-white"
          >
            <Eye className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
            {t('view_details')}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toast.dismiss(toastId)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToastContent;