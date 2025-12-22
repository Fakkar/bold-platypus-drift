import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTableLocation } from '@/context/TableLocationContext';

const CallWaiterButton: React.FC = () => {
  const { t } = useTranslation();
  const { tableId } = useTableLocation();
  const [loading, setLoading] = useState(false);

  const handleCallWaiter = async () => {
    if (!tableId) {
      toast.error(t('cannot_call_waiter_no_location'));
      return;
    }

    setLoading(true);
    try {
      // Insert a new record into the waiter_calls table
      const { error } = await supabase
        .from('waiter_calls')
        .insert({ location_id: tableId });

      if (error) {
        throw error;
      }

      toast.success(t('waiter_called_successfully'));
    } catch (error: any) {
      console.error('Error calling waiter:', error);
      toast.error(t('failed_to_call_waiter', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCallWaiter}
      disabled={loading || !tableId}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 rounded-full p-4 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center space-x-2 rtl:space-x-reverse"
    >
      <BellRing className="h-6 w-6 md:h-7 md:w-7" />
      <span className="hidden md:inline-block text-lg">{t('call_waiter')}</span>
    </Button>
  );
};

export default CallWaiterButton;