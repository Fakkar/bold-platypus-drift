import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import MenuItemCard from "@/components/MenuItemCard";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  order?: number;
  icon_url?: string;
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
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*, icon_url')
        .order('order', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        toast.error(t('failed_to_load_categories', { message: categoriesError.message }));
      } else {
        setCategories(categoriesData || []);
        if (categoriesData && categoriesData.length > 0) {
          const hashCategoryId = location.hash.replace('#category-', '');
          const foundCategory = categoriesData.find(cat => cat.id === hashCategoryId);
          setActiveTab(foundCategory ? foundCategory.id : categoriesData[0].id);
        }
      }

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
  }, [t, location.hash]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading menu...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-800 to-indigo-900">
      <Header />
      <HeroSection />

      <main className="flex-grow container mx-auto px-4 pt-0 pb-12">
        {categories.length === 0 ? (
          <p className="text-center text-gray-300">{t("no_categories_found")}</p>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex overflow-x-auto whitespace-nowrap space-x-4 p-4 bg-indigo-900/70 rounded-lg shadow-lg -mt-8 relative z-20">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id} 
                  className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-xl font-bold text-white bg-white/10 hover:bg-white/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:animate-pulse-shadow rounded-full px-8 py-4 transition-colors duration-200 flex-shrink-0"
                >
                  <span>{category.name}</span> {/* Name first */}
                  {category.icon_url && (
                    <img src={category.icon_url} alt={category.name} className="h-7 w-7 object-contain rounded-full mr-2 rtl:ml-2 rtl:mr-0" /> {/* Icon after name, adjusted size and margin */}
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-8">
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