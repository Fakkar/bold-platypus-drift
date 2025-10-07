import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import MenuItemCard from "@/components/MenuItemCard";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from "react-router-dom"; // Import useLocation

interface Category {
  id: string;
  name: string;
  order?: number;
  icon_url?: string; // New field for image icon URL
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
  const location = useLocation(); // Initialize useLocation
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined); // State for active tab

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*, icon_url') // Fetch icon_url
        .order('order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error(t('failed_to_load_categories', { message: categoriesError.message }));
      } else {
        setCategories(categoriesData || []);
        // Set initial active tab based on URL hash or first category
        if (categoriesData && categoriesData.length > 0) {
          const hashCategoryId = location.hash.replace('#category-', '');
          const foundCategory = categoriesData.find(cat => cat.id === hashCategoryId);
          setActiveTab(foundCategory ? foundCategory.id : categoriesData[0].id);
        }
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
  }, [t, location.hash]); // Re-run effect if hash changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading menu...")}</p>
      </div>
    );
  }

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  {category.icon_url && (
                    <img src={category.icon_url} alt={category.name} className="h-6 w-6 object-contain rounded-full" />
                  )}
                  <span>{category.name}</span>
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
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;