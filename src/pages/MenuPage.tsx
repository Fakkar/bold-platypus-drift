import React from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/HeroSection";
import MenuItemCard from "@/components/MenuItemCard";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dummy data for menu items
const dummyMenuItems = [
  {
    id: "1",
    name: "Special Burger",
    description: "Juicy beef patty, fresh lettuce, tomato, onion, and our secret sauce.",
    price: 12.99,
    imageUrl: "/public/burger.jpg", // Placeholder image
    category: "main_courses",
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, croutons, parmesan cheese, and creamy Caesar dressing.",
    price: 9.50,
    imageUrl: "/public/salad.jpg", // Placeholder image
    category: "appetizers",
  },
  {
    id: "3",
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs, hard cheese, cured pork, and black pepper.",
    price: 15.75,
    imageUrl: "/public/pasta.jpg", // Placeholder image
    category: "main_courses",
  },
  {
    id: "4",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten chocolate center, served with vanilla ice cream.",
    price: 7.00,
    imageUrl: "/public/dessert.jpg", // Placeholder image
    category: "desserts",
  },
  {
    id: "5",
    name: "Fresh Orange Juice",
    description: "Freshly squeezed oranges, no added sugar.",
    price: 4.00,
    imageUrl: "/public/orange-juice.jpg", // Placeholder image
    category: "drinks",
  },
  {
    id: "6",
    name: "Chicken Wings",
    description: "Crispy chicken wings tossed in your choice of buffalo or BBQ sauce.",
    price: 10.00,
    imageUrl: "/public/wings.jpg", // Placeholder image
    category: "appetizers",
  },
];

const MenuPage: React.FC = () => {
  const { t } = useTranslation();

  const categories = [
    { value: "all", label: t("all_items") },
    { value: "appetizers", label: t("appetizers") },
    { value: "main_courses", label: t("main_courses") },
    { value: "desserts", label: t("desserts") },
    { value: "drinks", label: t("drinks") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />

      <main className="flex-grow container mx-auto px-4 py-12">
        <h2 id="menu-items" className="text-4xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
          {t("our_menu")}
        </h2>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {dummyMenuItems
                  .filter((item) => category.value === "all" || item.category === category.value)
                  .map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MenuPage;