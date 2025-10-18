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
import { Input } from "@/components/ui/input";
import FeaturedItems from "@/components/FeaturedItems";
import { Search } from "lucide-react";
import CustomerClubModal from "@/components/CustomerClubModal";
import HafezDivination from "@/components/HafezDivination";

interface Category {
  id: string;
  name: any;
  order?: number;
  icon_url?: string;
}

interface MenuItem {
  id: string;
  name: any;
  description?: any;
  price: number;
  category_id?: string;
  image_url?: string;
  is_featured: boolean;
  is_available: boolean;
}

const MenuPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);

  useEffect(() => {
    const hasJoined = localStorage.getItem('customerClubJoined');
    if (hasJoined !== 'true') {
      setIsClubModalOpen(true);
    }

    const fetchData = async () => {
      setLoading(true);
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*, icon_url')
        .order('order', { ascending: true });

      if (categoriesError) {
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
        toast.error(t('failed_to_load_menu_items', { message: menuItemsError.message }));
      } else {
        setMenuItems(menuItemsData || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [t, location.hash]);

  const handleModalSuccess = () => {
    localStorage.setItem('customerClubJoined', 'true');
    setIsClubModalOpen(false);
  };

  const featuredItems = menuItems.filter(item => item.is_featured);
  const regularItems = menuItems.filter(item => !item.is_featured);

  const filteredItems = regularItems.filter(item => {
    const currentName = item.name[i18n.language] || item.name.fa || '';
    const currentDescription = item.description[i18n.language] || item.description.fa || '';
    return currentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           currentDescription.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p>{t("Loading menu...")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-800 to-indigo-900">
      <CustomerClubModal isOpen={isClubModalOpen} onSuccess={handleModalSuccess} />
      <Header />
      <HeroSection />
      <FeaturedItems items={featuredItems} />
      <HafezDivination />

      <main className="flex-grow container mx-auto px-4 pt-0 pb-12" dir="rtl">
        <div className="w-full max-w-md mx-auto my-8 px-4 relative">
          <Input
            type="text"
            placeholder={t('search_menu_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/20 text-white placeholder:text-gray-300 border-none rounded-full pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-gray-300">{t("no_categories_found")}</p>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="-mt-8 relative z-20">
              <div className="sticky top-0 z-30 py-4 bg-purple-900/80 backdrop-blur-sm">
                <TabsList className="flex flex-wrap justify-center gap-2 md:gap-4 p-2 bg-transparent shadow-none h-auto">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id} 
                      className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-white bg-white/10 hover:bg-white/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:animate-pulse-shadow rounded-full px-4 md:px-8 py-2 md:py-3 text-sm md:text-lg transition-colors duration-200 flex-shrink-0"
                    >
                      {category.icon_url && (
                        <img src={category.icon_url} alt={category.name[i18n.language] || category.name.fa} className="h-6 w-6 object-contain rounded-full" />
                      )}
                      <span>{category.name[i18n.language] || category.name.fa}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-8">
                <div 
                  className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
                  style={{ direction: 'rtl' }}
                >
                  {filteredItems
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