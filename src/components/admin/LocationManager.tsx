import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QRCodeCanvas } from 'qrcode.react';

interface Location {
  id: string;
  name: string;
}

const LocationManager: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurant_locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error(t('failed_to_load_locations'));
    } else {
      setLocations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) {
      toast.error(t('location_name_required'));
      return;
    }

    const { error } = await supabase
      .from('restaurant_locations')
      .insert({ name: newLocationName.trim() });

    if (error) {
      toast.error(t('failed_to_add_location'));
    } else {
      toast.success(t('location_added_successfully'));
      setNewLocationName('');
      fetchLocations();
    }
  };

  const handleDelete = async (locationId: string) => {
    const { error } = await supabase
      .from('restaurant_locations')
      .delete()
      .eq('id', locationId);

    if (error) {
      toast.error(t('failed_to_delete_location'));
    } else {
      toast.success(t('location_deleted_successfully'));
      fetchLocations();
    }
  };

  if (loading) {
    return <p>{t('Loading locations...')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('manage_locations')}</h3>
      <form onSubmit={handleAddLocation} className="flex items-center gap-2">
        <Input
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder={t('enter_location_name')}
        />
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" /> {t('add_location')}
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('location_name')}</TableHead>
              <TableHead className="text-center">{t('qr_code')}</TableHead>
              <TableHead className="text-center">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <QrCode className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('qr_code_for_location', { location: location.name })}</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-4">
                        <QRCodeCanvas value={`${window.location.origin}?table=${location.id}`} size={256} />
                        <p className="mt-4 text-sm text-muted-foreground">{t('scan_qr_for_location')}</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
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
                        <AlertDialogDescription>{t('this_action_cannot_be_undone_location')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(location.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
    </div>
  );
};

export default LocationManager;