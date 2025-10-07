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
  const [icon, setIcon] = useState(category?.icon || ''); // Keeping for potential text-based icons
  const [order, setOrder] = useState(category?.order?.toString() || '0');
  const [iconUrl, setIconUrl] = useState(category?.icon_url || ''); // For image URL from DB
  const [iconFile, setIconFile] = useState<File | null>(null); // For new image file upload
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || '');
      setOrder(category.order?.toString() || '0');
      setIconUrl(category.icon_url || '');
    }
  }, [category]);

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
      setIconUrl(URL.createObjectURL(e.target.files[0])); // For preview
    }
  };

  const handleRemoveIcon = async () => {
    if (category?.icon_url && category.icon_url !== '/public/placeholder.svg') {
      const filePath = category.icon_url.split('/category-icons/')[1]; // Extract path from URL
      await deleteFile(filePath, 'category-icons');
    }
    setIconUrl('');
    setIconFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalIconUrl = iconUrl;

    if (iconFile) {
      const processedFile = await compressAndResizeImage(iconFile);
      if (!processedFile) {
        setLoading(false);
        return; // Stop if image processing failed
      }

      // If there's an old icon and a new one is uploaded, delete the old one
      if (category?.icon_url && category.icon_url !== '/public/placeholder.svg') {
        const oldFilePath = category.icon_url.split('/category-icons/')[1];
        await deleteFile(oldFilePath, 'category-icons');
      }
      const uploadedUrl = await uploadFile(processedFile, 'category-icons');
      if (uploadedUrl) {
        finalIconUrl = uploadedUrl;
      } else {
        setLoading(false);
        return; // Stop if image upload failed
      }
    } else if (!iconUrl && category?.icon_url && category.icon_url !== '/public/placeholder.svg') {
      // If icon was removed and it was not a placeholder, delete from storage
      const oldFilePath = category.icon_url.split('/category-icons/')[1];
      await deleteFile(oldFilePath, 'category-icons');
      finalIconUrl = ''; // Set to empty string if removed
    } else if (!iconUrl) {
      finalIconUrl = ''; // Ensure it's empty if no URL and no file
    }

    const categoryData = {
      name,
      icon: icon || null, // Keep existing icon field for text-based icons if needed
      order: parseInt(order) || 0,
      icon_url: finalIconUrl || null, // New field for image URL
    };

    let error = null;
    if (category) {
      // Update existing category
      const { error: updateError } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', category.id);
      error = updateError;
    } else {
      // Add new category
      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoryData);
      error = insertError;
    }

    if (error) {
      console.error('Error saving category:', error);
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
          placeholder={t('enter_category_name')}
          required
        />
      </div>
      <div>
        <Label htmlFor="category-order">{t('category_order')}</Label>
        <Input
          id="category-order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder={t('enter_display_order')}
        />
      </div>
      <div>
        <Label htmlFor="category-icon-upload">{t('category_image_icon')}</Label>
        <Input
          id="category-icon-upload"
          type="file"
          accept="image/*"
          onChange={handleIconFileChange}
          disabled={uploadLoading || imageProcessing}
        />
        {iconUrl && (
          <div className="mt-2 flex items-center space-x-4">
            <img src={iconUrl} alt="Icon Preview" className="h-12 w-12 object-contain rounded-md border" />
            <Button variant="ghost" size="sm" onClick={handleRemoveIcon} className="text-destructive" disabled={uploadLoading || imageProcessing}>
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