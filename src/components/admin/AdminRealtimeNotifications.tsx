import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface AdminRealtimeNotificationsProps {
  onShowNotification: (type: 'order' | 'waiter', locationName: string, message?: string) => void;
}

interface OrderNotificationRow {
  id: string;
  location_id: string;
}

interface WaiterNotificationRow {
  id: string;
  location_id: string;
  is_resolved: boolean;
}

const AdminRealtimeNotifications: React.FC<AdminRealtimeNotificationsProps> = ({ onShowNotification }) => {
  const { t } = useTranslation();
  const startTimeRef = useRef(new Date().toISOString());
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const seenWaiterIdsRef = useRef<Set<string>>(new Set());

  const resolveLocationName = async (locationId: string) => {
    const { data, error } = await supabase
      .from('restaurant_locations')
      .select('name')
      .eq('id', locationId)
      .single();

    if (error) {
      console.error('Failed to resolve location name for notification:', error);
      return t('unknown_location');
    }

    return data?.name || t('unknown_location');
  };

  const showOrderNotification = async (order: OrderNotificationRow) => {
    if (seenOrderIdsRef.current.has(order.id)) {
      return;
    }

    seenOrderIdsRef.current.add(order.id);
    const locationName = await resolveLocationName(order.location_id);
    onShowNotification('order', locationName);
  };

  const showWaiterNotification = async (waiterCall: WaiterNotificationRow) => {
    if (waiterCall.is_resolved || seenWaiterIdsRef.current.has(waiterCall.id)) {
      return;
    }

    seenWaiterIdsRef.current.add(waiterCall.id);
    const locationName = await resolveLocationName(waiterCall.location_id);
    onShowNotification('waiter', locationName);
  };

  useEffect(() => {
    const waiterChannel = supabase
      .channel('admin_waiter_calls_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          const newCall = payload.new as WaiterNotificationRow;
          showWaiterNotification(newCall);
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('admin_orders_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as OrderNotificationRow;
          showOrderNotification(newOrder);
        }
      )
      .subscribe();

    const pollForMissedEvents = async () => {
      const since = startTimeRef.current;

      const [{ data: recentOrders, error: orderError }, { data: recentCalls, error: waiterError }] = await Promise.all([
        supabase
          .from('orders')
          .select('id, location_id, created_at')
          .gt('created_at', since)
          .order('created_at', { ascending: true }),
        supabase
          .from('waiter_calls')
          .select('id, location_id, is_resolved, created_at')
          .eq('is_resolved', false)
          .gt('created_at', since)
          .order('created_at', { ascending: true }),
      ]);

      if (orderError) {
        console.error('Failed polling recent orders for admin notifications:', orderError);
      }

      if (waiterError) {
        console.error('Failed polling recent waiter calls for admin notifications:', waiterError);
      }

      (recentOrders || []).forEach((order) => {
        showOrderNotification(order as OrderNotificationRow);
      });

      (recentCalls || []).forEach((waiterCall) => {
        showWaiterNotification(waiterCall as WaiterNotificationRow);
      });
    };

    const pollingInterval = window.setInterval(() => {
      pollForMissedEvents();
    }, 5000);

    pollForMissedEvents();

    return () => {
      window.clearInterval(pollingInterval);
      supabase.removeChannel(waiterChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [onShowNotification, t]);

  return null;
};

export default AdminRealtimeNotifications;
