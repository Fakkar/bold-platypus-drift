import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toPersianNumber } from '@/utils/format';

interface CustomerClubModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

const CustomerClubModal: React.FC<CustomerClubModalProps> = ({ isOpen, onSuccess }) => {
  const { t } = useTranslation();
  const [phoneSuffix, setPhoneSuffix] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneSuffix.length !== 9 || !/^\d{9}$/.test(phoneSuffix)) {
      toast.error(t('invalid_phone_number'));
      return;
    }
    setLoading(true);
    const fullPhoneNumber = `09${phoneSuffix}`;

    const { error } = await supabase.rpc('add_customer_visit', {
      phone_number_arg: fullPhoneNumber,
    });

    if (error) {
      console.error('Error joining customer club:', error);
      toast.error(t('club_join_error', { message: error.message }));
    } else {
      toast.success(t('club_join_success'));
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
        hideCloseButton={true} // Hide the default close button
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{t('join_our_club')}</DialogTitle>
          <DialogDescription className="text-center">
            {t('join_club_description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2" dir="ltr">
              <Input
                id="phone-suffix"
                value={phoneSuffix}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numbers
                  if (value.length <= 9) {
                    setPhoneSuffix(value);
                  }
                }}
                placeholder="۱۲۳۴۵۶۷۸۹"
                className="text-left tracking-wider"
                required
              />
              <span className="bg-muted px-3 py-2 rounded-md font-mono">
                {toPersianNumber('09')}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('saving') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerClubModal;