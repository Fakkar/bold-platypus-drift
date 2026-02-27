import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface AdminRealtimeNotificationsProps {
  onShowNotification: (type: 'order' | 'waiter', locationName: string, message?: string) => void;
}

const AdminRealtimeNotifications: React.FC<AdminRealtimeNotificationsProps> = ({ onShowNotification }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const waiterChannel = supabase
      .channel('admin_waiter_calls_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          const newCall = payload.new as { is_resolved: boolean; location_id: string };

          if (newCall.is_resolved) {
            return;
          }

          supabase
            .from('restaurant_locations')
            .select('name')
            .eq('id', newCall.location_id)
            .single()
            .then(({ data: locationData }) => {
              onShowNotification('waiter', locationData?.name || t('unknown_location'));
            });
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('admin_orders_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as { location_id: string };

          supabase
            .from('restaurant_locations')
            .select('name')
            .eq('id', newOrder.location_id)
            .single()
            .then(({ data: locationData }) => {
              onShowNotification('order', locationData?.name || t('unknown_location'));
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(waiterChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [onShowNotification, t]);

  return null;
};

export default AdminRealtimeNotifications;
