import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, BellOff, Trash2 } from 'lucide-react'; // Import Trash2 icon
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber } from '@/utils/format';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'; // Import AlertDialog components

interface WaiterCall {
  id: string;
  location_id: string;
  created_at: string;
  is_resolved: boolean;
  restaurant_locations: { name: string } | null;
}

const WaiterCallList: React.FC = () => {
  const { t } = useTranslation();
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [loading, setLoading] = useState(true);

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
                } else {
                  console.error('Error fetching location for new call:', error);
                  setCalls((prevCalls) => [{ ...newCall, restaurant_locations: null }, ...prevCalls]);
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
  }, [t]);

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

  const handleClearAllCalls = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('waiter_calls')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing all waiter calls:', error);
      toast.error(t('failed_to_clear_all_calls', { message: error.message }));
    } else {
      toast.success(t('all_calls_cleared_successfully'));
      setCalls([]);
    }
    setLoading(false);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('waiter_calls')}</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading || calls.length === 0}>
              <Trash2 className="ml-2 h-4 w-4" /> {t('clear_all_calls')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('are_you_absolutely_sure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('this_action_cannot_be_undone_all_calls')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllCalls} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('clear_all')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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
