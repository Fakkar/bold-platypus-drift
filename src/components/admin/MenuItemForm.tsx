import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { useImageProcessor } from '@/hooks/useImageProcessor'; // Import the new hook

interface MenuItemFormProps {
  menuItem?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    image_url?: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ menuItem, onSave, onCancel }) => {
  const { t } = useTranslation();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor(); // Initialize image processor hook

  const [name, setName] = useState(menuItem?.name || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(menuItem?.category_id || '');
  const [imageUrl, setImageUrl] = useState(menuItem?.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setDescription(menuItem.description || '');
      setPrice(menuItem.price.toString());
      setCategoryId(menuItem.category_id || '');
      setImageUrl(menuItem.image_url || '');
    }
  }, [menuItem]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        toast.error(t('failed_to_load_categories', { message: error.message }));
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, [t]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0])); // For preview
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = imageUrl;

    if (imageFile) {
      const processedFile = await compressAndResizeImage(imageFile);
      if (!processedFile) {
        setLoading(false);
        return; // Stop if image processing failed
      }

      // If there's an old image and a new one is uploaded, delete the old one
      if (menuItem?.image_url && menuItem.image_url !== '/public/placeholder.svg') {
        const oldFilePath = menuItem.image_url.split('/public/')[1]; // Extract path from URL
        await deleteFile(oldFilePath, 'menu-images');
      }
      const uploadedUrl = await uploadFile(processedFile, 'menu-images');
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      } else {
        setLoading(false);
        return; // Stop if image upload failed
      }
    } else if (!imageUrl && menuItem?.image_url && menuItem.image_url !== '/public/placeholder.svg') {
      // If image was removed and it was not a placeholder, delete from storage
      const oldFilePath = menuItem.image_url.split('/public/')[1];
      await deleteFile(oldFilePath, 'menu-images');
      finalImageUrl = '/public/placeholder.svg';
    } else if (!imageUrl) {
      finalImageUrl = '/public/placeholder.svg';
    }


    const menuItemData = {
      name,
      description: description || null,
      price: parseFloat(price),
      category_id: categoryId || null,
      image_url: finalImageUrl,
    };

    let error = null;
    if (menuItem) {
      // Update existing menu item
      const { error: updateError } = await supabase
        .from('menu_items')
        .update(menuItemData)
        .eq('id', menuItem.id);
      error = updateError;
    } else {
      // Add new menu item
      const { error: insertError } = await supabase
        .from('menu_items')
        .insert(menuItemData);
      error = insertError;
    }

    if (error) {
      console.error('Error saving menu item:', error);
      toast.error(t('failed_to_save_menu_item', { message: error.message }));
    } else {
      toast.success(t('menu_item_saved_successfully'));
      onSave();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="menu-item-name">{t('item_name')}</Label>
        <Input
          id="menu-item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('enter_item_name')}
          required
        />
      </div>
      <div>
        <Label htmlFor="menu-item-description">{t('item_description')}</Label>
        <Textarea
          id="menu-item-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('enter_item_description')}
        />
      </div>
      <div>
        <Label htmlFor="menu-item-price">{t('item_price')}</Label>
        <Input
          id="menu-item-price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t('enter_item_price')}
          required
        />
      </div>
      <div>
        <Label htmlFor="menu-item-category">{t('category')}</Label>
        <Select onValueChange={setCategoryId} value={categoryId}>
          <SelectTrigger id="menu-item-category">
            <SelectValue placeholder={t('select_category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="menu-item-image">{t('item_image')}</Label>
        <Input
          id="menu-item-image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={uploadLoading || imageProcessing}
        />
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="Item Preview" className="h-24 w-24 object-cover rounded-md" />
            <Button variant="ghost" size="sm" onClick={() => { setImageUrl(''); setImageFile(null); }} className="mt-1 text-destructive" disabled={uploadLoading || imageProcessing}>
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

export default MenuItemForm;