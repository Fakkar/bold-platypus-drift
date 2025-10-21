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
import { useImageProcessor } from '@/hooks/useImageProcessor';
import { Checkbox } from '@/components/ui/checkbox';
import { useDynamicTranslation } from '@/context/DynamicTranslationContext';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Variation {
  name: string;
  price: number | string;
  is_available?: boolean;
}

interface MenuItemFormProps {
  menuItem?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    image_url?: string;
    is_featured?: boolean;
    variations?: Variation[];
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
  const { tDynamic } = useDynamicTranslation();
  const { uploadFile, deleteFile, loading: uploadLoading } = useSupabaseStorage();
  const { compressAndResizeImage, loading: imageProcessing } = useImageProcessor();

  const [name, setName] = useState(menuItem?.name || '');
  const [description, setDescription] = useState(menuItem?.description || '');
  const [price, setPrice] = useState(menuItem?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(menuItem?.category_id || '');
  const [imageUrl, setImageUrl] = useState(menuItem?.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(menuItem?.is_featured || false);
  const [variations, setVariations] = useState<Variation[]>(menuItem?.variations || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name || '');
      setDescription(menuItem.description || '');
      setPrice(menuItem.price.toString());
      setCategoryId(menuItem.category_id || '');
      setImageUrl(menuItem.image_url || '');
      setIsFeatured(menuItem.is_featured || false);
      setVariations(menuItem.variations || []);
    }
  }, [menuItem]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('order', { ascending: true });
      if (error) {
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
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const addVariation = () => {
    setVariations([...variations, { name: '', price: '', is_available: true }]);
  };

  const updateVariation = (index: number, field: 'name' | 'price' | 'is_available', value: string | boolean) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setVariations(newVariations);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = imageUrl;

    if (imageFile) {
      const processedFile = await compressAndResizeImage(imageFile);
      if (processedFile) {
        if (menuItem?.image_url && menuItem.image_url !== '/public/placeholder.svg') {
          const oldFilePath = menuItem.image_url.split('/public/')[1];
          await deleteFile(oldFilePath, 'menu-images');
        }
        const uploadedUrl = await uploadFile(processedFile, 'menu-images');
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }
    }

    const menuItemData = {
      name,
      description,
      price: variations.length > 0 ? 0 : parseFloat(price),
      category_id: categoryId || null,
      image_url: finalImageUrl,
      is_featured: isFeatured,
      variations: variations.length > 0 ? variations.map(v => ({ ...v, price: parseFloat(v.price as string), is_available: v.is_available !== false })) : null,
    };

    const { error } = menuItem
      ? await supabase.from('menu_items').update(menuItemData).eq('id', menuItem.id)
      : await supabase.from('menu_items').insert(menuItemData);

    if (error) {
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
        <Input id="menu-item-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('enter_item_name')} />
      </div>
      <div>
        <Label htmlFor="menu-item-description">{t('item_description')}</Label>
        <Textarea id="menu-item-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('enter_item_description')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {variations.length === 0 && (
          <div>
            <Label htmlFor="menu-item-price">{t('item_price')}</Label>
            <Input id="menu-item-price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={t('enter_item_price')} required />
          </div>
        )}
        <div>
          <Label htmlFor="menu-item-category">{t('category')}</Label>
          <Select onValueChange={setCategoryId} value={categoryId}>
            <SelectTrigger id="menu-item-category"><SelectValue placeholder={t('select_category')} /></SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{tDynamic(cat.name)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>{t('variations')}</Label>
        <div className="space-y-2">
          {variations.map((v, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex flex-col items-center justify-center pt-2">
                <Switch
                  checked={v.is_available !== false}
                  onCheckedChange={(checked) => updateVariation(index, 'is_available', checked)}
                  aria-label={t('availability')}
                />
                <Label className="text-xs mt-1 text-muted-foreground">{t('availability')}</Label>
              </div>
              <Input placeholder={t('variation_name_placeholder')} value={v.name} onChange={(e) => updateVariation(index, 'name', e.target.value)} />
              <Input type="number" placeholder={t('variation_price_placeholder')} value={v.price as string} onChange={(e) => updateVariation(index, 'price', e.target.value)} />
              <Button type="button" variant="destructive" size="icon" onClick={() => removeVariation(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addVariation} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" /> {t('add_variation')}
        </Button>
      </div>

      <div>
        <Label htmlFor="menu-item-image">{t('item_image')}</Label>
        <Input id="menu-item-image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploadLoading || imageProcessing} />
        {imageUrl && (
          <div className="mt-2">
            <img src={imageUrl} alt="Item Preview" className="h-24 w-24 object-cover rounded-md" />
            <Button variant="ghost" size="sm" onClick={() => { setImageUrl(''); setImageFile(null); }} className="mt-1 text-destructive">
              {t('remove_image')}
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox id="is-featured" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(Boolean(checked))} />
        <Label htmlFor="is-featured" className="cursor-pointer">{t('featured_item')}</Label>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading || uploadLoading || imageProcessing}>{t('cancel')}</Button>
        <Button type="submit" disabled={loading || uploadLoading || imageProcessing}>{loading || uploadLoading || imageProcessing ? t('saving') : t('save')}</Button>
      </DialogFooter>
    </form>
  );
};

export default MenuItemForm;