import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CategoryForm from './CategoryForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';

interface Category {
  id: string;
  name: string;
  icon?: string;
  order?: number;
  icon_url?: string;
}

const CategoryList: React.FC = () => {
  const { t } = useTranslation();
  const { tDynamic } = useDynamicTranslation();
  const { deleteFile } = useSupabaseStorage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      toast.error(t('failed_to_load_categories', { message: error.message }));
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (category.icon_url) {
      const filePath = category.icon_url.split('/category-icons/')[1];
      await deleteFile(filePath, 'category-icons');
    }

    const { error } = await supabase.from('categories').delete().eq('id', category.id);

    if (error) {
      toast.error(t('failed_to_delete_category', { message: error.message }));
    } else {
      toast.success(t('category_deleted_successfully'));
      fetchCategories();
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCategory(undefined);
    fetchCategories();
  };

  if (loading) {
    return <p>{t('Loading categories...')}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('manage_categories')}</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedCategory(undefined); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> {t('add_category')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedCategory ? t('edit_category') : t('add_category')}</DialogTitle>
            </DialogHeader>
            <CategoryForm category={selectedCategory} onSave={handleFormClose} onCancel={handleFormClose} />
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <p>{t('no_categories_found')}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('icon')}</TableHead>
                <TableHead>{t('order')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{tDynamic(category.name)}</TableCell>
                  <TableCell>
                    {category.icon_url ? (
                      <img src={category.icon_url} alt={category.name} className="h-8 w-8 object-contain rounded-full" />
                    ) : (
                      category.icon || '-'
                    )}
                  </TableCell>
                  <TableCell>{category.order}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
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
                            {t('this_action_cannot_be_undone_category')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(category)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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

export default CategoryList;