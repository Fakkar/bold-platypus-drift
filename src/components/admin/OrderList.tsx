import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'; // Added DialogDescription
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, CheckCircle, XCircle, Printer, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber, formatPriceInToman } from '@/utils/format';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';
import { Separator } from '@/components/ui/separator';
// Removed NotificationDialog import
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

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

interface OrderListProps {
  onShowNotification: (type: 'order' | 'waiter', locationName: string, message?: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ onShowNotification }) => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  // Removed local notification state

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant_locations(name), order_items(*, menu_items(name, image_url))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('failed_to_load_orders', { message: error.message }));
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    console.log('Subscribing to orders_channel');
    const channel = supabase
      .channel('orders_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Realtime: New order event received!', payload);
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
                console.log('Triggering global notification for new order:', { type: 'order', locationName: locationName });
                onShowNotification('order', locationName);
              } else {
                console.error('Error fetching full order data for new order:', fullOrderError);
                console.log('Triggering global notification for new order (unknown location):', { type: 'order', locationName: t('unknown_location') });
                onShowNotification('order', t('unknown_location'));
              }
            });
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from orders_channel');
      supabase.removeChannel(channel);
    };
  }, [t, onShowNotification]);

  const handleViewDetails = (order: Order) => {
    console.log("handleViewDetails called for order:", order.id);
    setSelectedOrder(order);
    setIsDetailsDialogOpen(true);
    console.log("Setting isDetailsDialogOpen to true");
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

  const handleDeleteOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      toast.error(t('failed_to_delete_order', { message: error.message }));
    } else {
      toast.success(t('order_deleted_successfully'));
      fetchOrders(); // Re-fetch orders to update the list
    }
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=300,height=400'); // 8cm is roughly 300px
    if (!printWindow) {
      toast.error(t('failed_to_open_print_window'));
      return;
    }

    const orderDetailsHtml = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${t('order_receipt')}</title>
          <style>
              body { font-family: 'Vazirmatn', 'IRANSans', sans-serif; margin: 0; padding: 10px; font-size: 12px; line-height: 1.4; color: #000; }
              h1, h2, h3 { text-align: center; margin-bottom: 5px; }
              .header { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 10px; }
              .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .item-name { flex-grow: 1; }
              .item-qty { width: 30px; text-align: center; }
              .item-price { width: 60px; text-align: left; }
              .total { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; }
              .notes { font-size: 10px; color: #555; margin-top: 2px; }
              .footer { text-align: center; margin-top: 20px; font-size: 10px; }
              @media print {
                  body { width: 8cm; } /* Set width for 8cm thermal paper */
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>${tDynamic(selectedOrder?.restaurant_locations?.name || t('order_from_unknown_location'))}</h1>
              <h2>${t('order_receipt')}</h2>
              <p style="text-align: center;">${formatDate(order.created_at)}</p>
              <p style="text-align: center;">${t('order_id')}: ${order.id.substring(0, 8)}</p>
          </div>
          
          <h3>${t('items')}</h3>
          ${order.order_items.map(item => `
              <div class="item">
                  <span class="item-name">${tDynamic(item.menu_items?.name || t('order_from_unknown_item'))} ${item.variations ? `(${tDynamic(item.variations.name)})` : ''}</span>
                  <span class="item-qty">${toPersianNumber(item.quantity)}x</span>
                  <span class="item-price">${formatPriceInToman(item.price)}</span>
              </div>
              ${item.notes ? `<div class="notes">${t('notes')}: ${item.notes}</div>` : ''}
          `).join('')}

          <div class="total">
              <span>${t('total')}:</span>
              <span>${formatPriceInToman(order.total_amount)}</span>
          </div>

          <div class="footer">
              <p>${t('thank_you_for_your_order')}</p>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(orderDetailsHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
                    <Button variant="ghost" size="icon" onClick={() => handlePrintOrder(order)}>
                      <Printer className="h-4 w-4" />
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('are_you_absolutely_sure')}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('this_action_cannot_be_undone_order')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {t('delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rtl:text-right">
          <DialogHeader>
            <DialogTitle>{t('order_details')}</DialogTitle>
            <DialogDescription>
              {t('order_from_table')}: {selectedOrder?.restaurant_locations?.name || t('unknown_location')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><strong>{t('order_id')}:</strong> {selectedOrder.id.substring(0, 8)}</p>
                <p><strong>{t('order_time')}:</strong> {formatDate(selectedOrder.created_at)}</p>
                <p><strong>{t('status')}:</strong> <span className={`font-medium ${getStatusColor(selectedOrder.status)}`}>{t(`order_status_${selectedOrder.status}`)}</span></p>
                <p><strong>{t('total')}:</strong> <span dir="rtl">{formatPriceInToman(selectedOrder.total_amount)}</span></p>
              </div>
              <Separator />
              <h4 className="text-lg font-semibold">{t('items')}</h4>
              <div className="space-y-3">
                {selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                    {item.menu_items?.image_url && (
                      <img src={item.menu_items.image_url} alt={tDynamic(item.menu_items.name)} className="h-12 w-12 object-cover rounded-md" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{tDynamic(item.menu_items?.name || t('order_from_unknown_item'))}</p>
                      {item.variations && (
                        <p className="text-sm text-muted-foreground">{tDynamic(item.variations.name)}</p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground italic">{t('notes')}: {item.notes}</p>
                      )}
                    </div>
                    <div className="text-sm text-right">
                      <p>{toPersianNumber(item.quantity)} x <span dir="rtl">{formatPriceInToman(item.price)}</span></p>
                      <p className="font-semibold" dir="rtl">{formatPriceInToman(item.quantity * item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderList;