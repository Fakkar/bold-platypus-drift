import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BellRing, UtensilsCrossed, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'order' | 'waiter';
  locationName: string;
  message?: string;
}

const NotificationDialog: React.FC<NotificationDialogProps> = ({ isOpen, onClose, type, locationName, message }) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const title = type === 'order' ? t('new_order_notification', { location: locationName }) : t('new_waiter_call_notification', { location: locationName });
  const description = message || (type === 'order' ? t('new_order_notification_generic') : t('new_waiter_call_notification_generic'));
  const icon = type === 'order' ? <UtensilsCrossed className="h-8 w-8 text-primary" /> : <BellRing className="h-8 w-8 text-primary" />;
  const audioSrc = type === 'order' ? '/sounds/order-notification.mp3' : '/sounds/notification.mp3';

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play().catch(e => console.error(`Error playing ${type} notification audio:`, e));
    }
  }, [isOpen, type]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rtl:text-right">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <DialogDescription className="text-lg text-muted-foreground">
          {description}
        </DialogDescription>
        <audio ref={audioRef} src={audioSrc} preload="auto" />
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;