import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { Copy, QrCode } from 'lucide-react';

const QRCodeGenerator: React.FC = () => {
  const { t } = useTranslation();
  const menuUrl = window.location.origin;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success(t('url_copied_to_clipboard'));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          {t('generate_qr_code')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('qr_code_for_menu')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 space-y-4">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeCanvas value={menuUrl} size={256} />
          </div>
          <div className="flex w-full items-center space-x-2 rtl:space-x-reverse p-2 border rounded-md bg-muted">
            <span className="text-sm text-muted-foreground flex-grow text-left" dir="ltr">{menuUrl}</span>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500">{t('qr_code_instruction')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;