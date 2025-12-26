import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, BellOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber } from '@/utils/format';
// Removed NotificationDialog import

interface WaiterCall {
  id: string;
  location_id: string;
  created_at: string;
  is_resolved: boolean;
  restaurant_locations: { name: string } | null;
}

interface WaiterCallListProps {
  onShowNotification: (type: 'order' | 'waiter', locationName: string, message?: string) => void;
}

const WaiterCallList: React.FC<WaiterCallListProps> = ({ onShowNotification }) => {
  const { t } = useTranslation();
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed local notification state

  const fetchCalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('waiter_calls')
      .select('*, restaurant_locations(name)')
      .eq('is_resolved', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching waiter calls:', error);
      toast.error(t('failed_to_load_waiter_calls', { message: error.message }));
    } else {
      setCalls(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCalls();

    console.log('Subscribing to waiter_calls_channel');
    const channel = supabase
      .channel('waiter_calls_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'waiter_calls' },
        (payload) => {
          console.log('Realtime: New waiter call event received!', payload);
          const newCall = payload.new as WaiterCall;
          if (!newCall.is_resolved) {
            // Fetch the location name for the new call
            supabase
              .from('restaurant_locations')
              .select('name')
              .eq('id', newCall.location_id)
              .single()
              .then(({ data: locationData, error }) => {
                if (!error && locationData) {
                  const callWithLocation = { ...newCall, restaurant_locations: locationData };
                  setCalls((prevCalls) => [callWithLocation, ...prevCalls]);
                  console.log('Triggering global notification for waiter call:', { type: 'waiter', locationName: locationData.name });
                  onShowNotification('waiter', locationData.name);
                } else {
                  console.error('Error fetching location for new call:', error);
                  setCalls((prevCalls) => [{ ...newCall, restaurant_locations: null }, ...prevCalls]);
                  console.log('Triggering global notification for waiter call (unknown location):', { type: 'waiter', locationName: t('unknown_location') });
                  onShowNotification('waiter', t('unknown_location'));
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from waiter_calls_channel');
      supabase.removeChannel(channel);
    };
  }, [t, onShowNotification]);

  const handleResolveCall = async (callId: string) => {
    const { error } = await supabase
      .from('waiter_calls')
      .update({ is_resolved: true })
      .eq('id', callId);

    if (error) {
      toast.error(t('failed_to_resolve_call', { message: error.message }));
    } else {
      toast.success(t('call_resolved_successfully'));
      setCalls(calls.filter(call => call.id !== callId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <p>{t('Loading waiter calls...')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('waiter_calls')}</h3>
      {calls.length === 0 ? (
        <p>{t('no_pending_waiter_calls')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('location')}</TableHead>
                <TableHead>{t('time')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="font-medium">
                    {call.restaurant_locations?.name || t('unknown_location')}
                  </TableCell>
                  <TableCell>{formatDate(call.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleResolveCall(call.id)}>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WaiterCallList;