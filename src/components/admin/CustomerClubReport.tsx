import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRange } from 'react-day-picker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber } from '@/utils/format';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { subDays } from 'date-fns';

interface ReportData {
  newCustomers: number;
  repeatCustomers: number;
  totalCustomers: number;
  totalVisits: number;
}

const CustomerClubReport: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast.error(t('select_date_range'));
      return;
    }

    setLoading(true);
    setReportData(null);

    const { data, error } = await supabase
      .from('customer_club')
      .select('created_at, visit_history, phone_number');

    if (error) {
      toast.error(t('failed_to_generate_report'));
      setLoading(false);
      return;
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to;

    let newCustomers = 0;
    const uniqueCustomers = new Set<string>();
    let totalVisits = 0;
    let repeatCustomers = 0;

    data.forEach(customer => {
      const createdAt = new Date(customer.created_at);
      if (createdAt >= startDate && createdAt <= endDate) {
        newCustomers++;
      }

      const visitsInDateRange = customer.visit_history.filter(visit => {
        const visitDate = new Date(visit);
        return visitDate >= startDate && visitDate <= endDate;
      });

      if (visitsInDateRange.length > 0) {
        uniqueCustomers.add(customer.phone_number);
        totalVisits += visitsInDateRange.length;
        if (visitsInDateRange.length > 1) {
          repeatCustomers++;
        }
      }
    });

    setReportData({
      newCustomers,
      repeatCustomers,
      totalCustomers: uniqueCustomers.size,
      totalVisits,
    });

    setLoading(false);
  };

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-xl font-semibold">{t('customer_club_report')}</h3>
        <div className="flex items-center gap-2">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Button onClick={generateReport} disabled={loading}>
            {loading ? t('generating_report') : t('generate_report')}
          </Button>
        </div>
      </div>

      {reportData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('new_customers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toPersianNumber(reportData.newCustomers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('repeat_customers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toPersianNumber(reportData.repeatCustomers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_customers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toPersianNumber(reportData.totalCustomers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('total_visits')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toPersianNumber(reportData.totalVisits)}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerClubReport;