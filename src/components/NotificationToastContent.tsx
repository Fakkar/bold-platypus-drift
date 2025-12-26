import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BellRing, UtensilsCrossed, Eye, X, Play } from 'lucide-react'; // Import Play icon
import { cn } from '@/lib/utils';
import { useRestaurantSettings } from '@/context/RestaurantSettingsContext'; // Import settings

interface NotificationToastContentProps {
  type: 'order' | 'waiter';
  locationName: string;
  message?: string;
  toastId: string | number;
}

const NotificationToastContent: React.FC<NotificationToastContentProps> = ({ type, locationName, message, toastId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings } = useRestaurantSettings(); // Get settings

  const title = type === 'order' ? t('new_order_notification', { location: locationName }) : t('new_waiter_call_notification', { location: locationName });
  const description = message || (type === 'order' ? t('new_order_notification_generic') : t('new_waiter_call_notification_generic'));
  const icon = type === 'order' ? <UtensilsCrossed className="h-6 w-6" /> : <BellRing className="h-6 w-6" />;
  
  // Use dynamic sound URLs from settings
  const audioSrc = type === 'order' ? settings.order_sound_url : settings.waiter_call_sound_url;
  const bgColor = type === 'order' ? 'bg-green-600' : 'bg-blue-600';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error(`Error playing ${type} notification audio:`, e));
    }
  }, [type, audioSrc]); // Add audioSrc to dependency array

  const handleViewClick = () => {
    toast.dismiss(toastId); // Dismiss the toast when "View" is clicked
    if (type === 'order') {
      navigate('/admin?view=orders');
    } else {
      navigate('/admin?view=waiter-calls');
    }
  };

  return (
    <div className={cn("flex items-start p-4 rounded-md shadow-lg text-white w-full", bgColor)}>
      <div className="mr-3 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-sm mt-1">{description}</p>
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
      <audio ref={audioRef} src={audioSrc} preload="auto" />
    </div>
  );
};

export default NotificationToastContent;