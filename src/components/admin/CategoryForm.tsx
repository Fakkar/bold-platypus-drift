import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryFormProps {
  category?: { id: string; name: string; icon?: string; order?: number };
  onSave: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '');
  const [order, setOrder] = useState(category?.order?.toString() || '0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || '');
      setOrder(category.order?.toString() || '0');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const categoryData = {
      name,
      icon: icon || null,
      order: parseInt(order) || 0,
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
        <Label htmlFor="category-icon">{t('category_icon')}</Label>
        <Input
          id="category-icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder={t('enter_icon_name_or_url')}
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
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('saving') : t('save')}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CategoryForm;