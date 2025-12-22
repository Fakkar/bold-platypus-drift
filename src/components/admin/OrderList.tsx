import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber, formatPriceInToman } from '@/utils/format';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';
import { Separator } from '@/components/ui/separator'; // Import Separator

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  variations?: { name: string; price: number };
  menu_items: { name: string; image_url?: string } | null;
}

interface Order {
  id: string;
  location_id: string;
  total_amount: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  created_at: string;
  restaurant_locations: { name: string } | null;
  order_items: OrderItem[];
}

const OrderList: React.FC = () => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant_locations(name), order_items(*, menu_items(name, image_url))')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(t('failed_to_load_orders', { message: error.message }));
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Setup Supabase Realtime listener for new orders
    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          // Fetch related data for the new order
          supabase
            .from('orders')
            .select('*, restaurant_locations(name), order_items(*, menu_items(name, image_url))')
            .eq('id', newOrder.id)
            .single()
            .then(({ data: fullOrderData, error: fullOrderError }) => {
              if (!fullOrderError && fullOrderData) {
                setOrders((prevOrders) => [fullOrderData, ...prevOrders]);
                const locationName = fullOrderData.restaurant_locations?.name || t('unknown_location');
                toast.info(t('new_order_notification', { location: locationName }));
                if (audioRef.current) {
                  audioRef.current.play();
                }
              } else {
                console.error('Error fetching full order data for new order:', fullOrderError);
                toast.info(t('new_order_notification_generic'));
                if (audioRef.current) {
                  audioRef.current.play();
                }
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [t]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error(t('failed_to_update_order_status', { message: error.message }));
    } else {
      toast.success(t('status_updated'));
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'new': return 'text-blue-500';
      case 'preparing': return 'text-yellow-500';
      case 'ready': return 'text-green-500';
      case 'delivered': return 'text-gray-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
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
    return <p>{t('Loading orders...')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('manage_orders')}</h3>

      {orders.length === 0 ? (
        <p>{t('no_orders_found')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('order_id')}</TableHead>
                <TableHead>{t('table')}</TableHead>
                <TableHead>{t('total')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('order_time')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                  <TableCell>{order.restaurant_locations?.name || t('unknown_location')}</TableCell>
                  <TableCell dir="rtl">{formatPriceInToman(order.total_amount)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${getStatusColor(order.status)}`}>
                      {t(`order_status_${order.status}`)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-right flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Select value={order.status} onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t('change_status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t('order_status_new')}</SelectItem>
                        <SelectItem value="preparing">{t('order_status_preparing')}</SelectItem>
                        <SelectItem value="ready">{t('order_status_ready')}</SelectItem>
                        <SelectItem value="delivered">{t('order_status_delivered')}</SelectItem>
                        <SelectItem value="cancelled">{t('order_status_cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rtl:text-right">
          <DialogHeader>
            <DialogTitle>{t('order_details')} - {selectedOrder?.id.substring(0, 8)}...</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <p><strong>{t('order_from_table')}:</strong> {selectedOrder.restaurant_locations?.name || t('order_from_unknown_location')}</p>
              <p><strong>{t('total')}:</strong> <span dir="rtl">{formatPriceInToman(selectedOrder.total_amount)}</span></p>
              <p><strong>{t('status')}:</strong> {t(`order_status_${selectedOrder.status}`)}</p>
              <p><strong>{t('order_time')}:</strong> {formatDate(selectedOrder.created_at)}</p>

              <Separator />

              <h4 className="font-semibold text-lg">{t('items')}</h4>
              <div className="space-y-3">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-3 last:border-b-0 last:pb-0">
                    {item.menu_items?.image_url && (
                      <img src={item.menu_items.image_url} alt={tDynamic(item.menu_items.name || '')} className="h-12 w-12 object-cover rounded-md" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{tDynamic(item.menu_items?.name || t('unknown_item'))}</p>
                      {item.variations && (
                        <p className="text-sm text-muted-foreground">{tDynamic(item.variations.name)}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {toPersianNumber(item.quantity)} x <span dir="rtl">{formatPriceInToman(item.price)}</span>
                      </p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic">{t('notes')}: {item.notes}</p>
                      )}
                    </div>
                    <span className="font-semibold text-primary" dir="rtl">
                      {formatPriceInToman(item.quantity * item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
    </div>
  );
};

export default OrderList;