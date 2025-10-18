import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { useImageProcessor } from '@/hooks/useImageProcessor';

interface CategoryFormProps {
  category?: { id: string; name: string; icon?: string; order?: number; icon_url?: string };
  onSave: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor();

  const [name, setName] = useState(category?.name || '');
  const [order, setOrder] = useState(category?.order?.toString() || '0');
  const [iconUrl, setIconUrl] = useState(category?.icon_url || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setOrder(category.order?.toString() || '0');
      setIconUrl(category.icon_url || '');
    }
  }, [category]);

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
      setIconUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalIconUrl = iconUrl;

    if (iconFile) {
      const processedFile = await compressAndResizeImage(iconFile);
      if (processedFile) {
        if (category?.icon_url && category.icon_url !== '/public/placeholder.svg') {
          const oldFilePath = category.icon_url.split('/category-icons/')[1];
          await deleteFile(oldFilePath, 'category-icons');
        }
        const uploadedUrl = await uploadFile(processedFile, 'category-icons');
        if (uploadedUrl) finalIconUrl = uploadedUrl;
      }
    }

    const categoryData = {
      name,
      order: parseInt(order) || 0,
      icon_url: finalIconUrl || null,
    };

    const { error } = category
      ? await supabase.from('categories').update(categoryData).eq('id', category.id)
      : await supabase.from('categories').insert(categoryData);

    if (error) {
      toast.error(t('failed_to_save_category', { message: error.message }));
    } else {
      toast.success(t('category_saved_successfully'));
      onSave();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name">{t('category_name')}</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${t('enter_category_name')}...`}
        />
      </div>
      <div>
        <Label htmlFor="category-order">{t('category_order')}</Label>
        <Input id="category-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="category-icon-upload">{t('category_image_icon')}</Label>
        <Input id="category-icon-upload" type="file" accept="image/*" onChange={handleIconFileChange} disabled={uploadLoading || imageProcessing} />
        {iconUrl && (
          <div className="mt-2 flex items-center space-x-4">
            <img src={iconUrl} alt="Icon Preview" className="h-12 w-12 object-contain rounded-md border" />
            <Button variant="ghost" size="sm" onClick={() => { setIconUrl(''); setIconFile(null); }} className="text-destructive">
              {t('remove_image')}
            </Button>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading || uploadLoading || imageProcessing}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading || uploadLoading || imageProcessing}>
          {loading || uploadLoading || imageProcessing ? t('saving') : t('save')}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;