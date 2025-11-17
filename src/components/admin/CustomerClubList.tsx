import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toPersianNumber } from '@/utils/format';

interface Customer {
  id: string;
  phone_number: string;
  visit_history: string[];
  visit_count: number;
  created_at: string;
}

const CustomerClubList: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customer_club')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      toast.error(t('failed_to_load_customers', { message: error.message }));
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // اضافه شد: خروجی اکسل شماره‌ها
  const exportPhoneNumbersToExcel = () => {
    const phoneNumbers = customers.map((c) => ({ phone_number: c.phone_number }));
    const worksheet = XLSX.utils.json_to_sheet(phoneNumbers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PhoneNumbers');
    XLSX.writeFile(workbook, 'customer-club-phone-numbers.xlsx');
    toast.success('فایل اکسل شماره‌ها دانلود شد.');
  };

  const handleDelete = async (customerId: string) => {
    const { error } = await supabase
      .from('customer_club')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      toast.error(t('failed_to_delete_customer', { message: error.message }));
    } else {
      toast.success(t('customer_deleted_successfully'));
      fetchCustomers();
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
    return <p>{t('Loading customers...')}</p>;
  }

  return (
    <div className="space-y-4">
      {/* نوار عنوان + دکمه خروجی اکسل */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">{t('customer_club')}</h3>
        <Button
          variant="outline"
          onClick={exportPhoneNumbersToExcel}
          disabled={customers.length === 0}
          className="rtl:flex-row-reverse"
        >
          <Download className="h-4 w-4 ml-2 rtl:ml-0 rtl:mr-2" />
          خروجی اکسل شماره‌ها
        </Button>
      </div>

      {customers.length === 0 ? (
        <p>{t('no_customers_found')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{t('phone_number')}</TableHead>
                <TableHead className="text-right">{t('first_visit')}</TableHead>
                <TableHead className="text-right">{t('last_visit')}</TableHead>
                <TableHead className="text-right">{t('total_visits')}</TableHead>
                <TableHead className="text-center">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium text-right" dir="ltr">{toPersianNumber(customer.phone_number)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatDate(customer.created_at)}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{formatDate(customer.visit_history[customer.visit_history.length - 1])}</TableCell>
                  <TableCell className="text-right">{toPersianNumber(customer.visit_count)}</TableCell>
                  <TableCell className="text-center">
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
                            {t('this_action_cannot_be_undone_customer')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(customer.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
    </div>
  );
};

export default CustomerClubList;