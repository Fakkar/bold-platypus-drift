import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MenuItemForm from './MenuItemForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { Switch } from '@/components/ui/switch';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  categories?: { name: string };
  is_available: boolean;
  is_featured?: boolean;
  image_url?: string;
}

const MenuItemList: React.FC = () => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { deleteFile } = useSupabaseStorage();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | undefined>(undefined);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, categories(name)')
      .order('name', { ascending: true });

    if (error) {
      toast.error(t('failed_to_load_menu_items', { message: error.message }));
    } else {
      setMenuItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAvailabilityToggle = async (item: MenuItem) => {
    const newStatus = !item.is_available;
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: newStatus })
      .eq('id', item.id);

    if (error) {
      toast.error(t('failed_to_update_status', { message: error.message }));
    } else {
      toast.success(t('status_updated_successfully'));
      setMenuItems(menuItems.map(mi => mi.id === item.id ? { ...mi, is_available: newStatus } : mi));
    }
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (item.image_url && item.image_url !== '/public/placeholder.svg') {
      const filePath = item.image_url.split('/public/')[1];
      await deleteFile(filePath, 'menu-images');
    }

    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);

    if (error) {
      toast.error(t('failed_to_delete_menu_item', { message: error.message }));
    } else {
      toast.success(t('menu_item_deleted_successfully'));
      fetchMenuItems();
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMenuItem(undefined);
    fetchMenuItems();
  };

  if (loading) {
    return <p>{t('Loading menu items...')}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('manage_menu_items')}</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedMenuItem(undefined); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t('add_menu_item')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedMenuItem ? t('edit_menu_item') : t('add_menu_item')}</DialogTitle>
            </DialogHeader>
            <MenuItemForm menuItem={selectedMenuItem} onSave={handleFormClose} onCancel={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      {menuItems.length === 0 ? (
        <p>{t('no_menu_items_found')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('image')}</TableHead>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('price')}</TableHead>
                <TableHead>{t('availability')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img src={item.image_url || '/public/placeholder.svg'} alt={item.name} className="h-10 w-10 object-cover rounded-md" />
                  </TableCell>
                  <TableCell className="font-medium">{tDynamic(item.name)}</TableCell>
                  <TableCell>{item.categories ? tDynamic(item.categories.name) : t('uncategorized')}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Switch checked={item.is_available} onCheckedChange={() => handleAvailabilityToggle(item)} aria-label={t('availability')} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('are_you_absolutely_sure')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('this_action_cannot_be_undone_menu_item')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('delete')}</AlertDialogAction>
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

export default MenuItemList;