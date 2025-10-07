import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import MenuItemCard from "@/components/MenuItemCard";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
// import WorkingHours from "@/components/WorkingHours"; // WorkingHours component removed as per request

interface Category {
  id: string;
  name: string;
  order?: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url?: string;
}

const MenuPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error(t('failed_to_load_categories', { message: categoriesError.message }));
      } else {
        // Removed "all items" category as per request
        setCategories(categoriesData || []);
      }

      // Fetch menu items
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

      if (menuItemsError) {
        console.error('Error fetching menu items:', menuItemsError);
        toast.error(t('failed_to_load_menu_items', { message: menuItemsError.message }));
      } else {
        setMenuItems(menuItemsData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading menu...")}</p>
      </div>
    );
  }

  // Determine the default tab value. If there are categories, use the first one's ID.
  // Otherwise, default to an empty string or handle the no-category case.
  const defaultTabValue = categories.length > 0 ? categories[0].id : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />

      <main className="flex-grow container mx-auto px-4 py-12">
        <h2 id="menu-items" className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
          {t("our_menu")}
        </h2>

        {categories.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">{t("no_categories_found")}</p>
        ) : (
          <Tabs defaultValue={defaultTabValue} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {menuItems
                    .filter((item) => item.category_id === category.id)
                    .map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* WorkingHours component removed as per request */}
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;