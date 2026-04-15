"use client";

import { useState, useEffect, useRef } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/NavBar";
import Hero from "./components/Hero";
import MenuTabs from "./components/MenuTabs";
import Footer from "./components/Footer";
import DeliveryPickupModal from "./components/DeliveryPickupModal";
import MenuSection from "./components/MenuSection";
import CartButton from "./components/CartButton";
import { useBranchStore } from "../store/branchStore";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [visibleCategory, setVisibleCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { branch } = useBranchStore();
  const isInitialLoad = useRef(true);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/923122754064", "_blank");
  };

  const getId = (idField) => {
    if (typeof idField === 'object' && idField !== null) {
      if (idField.$oid) return idField.$oid;
      if (idField._id) return getId(idField._id);
    }
    return idField;
  };

  useEffect(() => {
    if (!branch) return;
    
    setLoading(true);

    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, itemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/subcategories'),
          fetch('/api/fooditems')
        ]);

        const [categoriesData, subcategoriesData, itemsData] = await Promise.all([
          categoriesRes.json(),
          subcategoriesRes.json(),
          itemsRes.json()
        ]);

        const filteredCategories = categoriesData.filter((cat) => {
          if (cat.branch) {
            const catBranch = typeof cat.branch === 'object' ? getId(cat.branch) : cat.branch;
            return catBranch === getId(branch);
          }
          return false;
        });
        
        const filteredSubcategories = subcategoriesData.filter((sub) => {
          if (sub.branch) {
            const subBranch = typeof sub.branch === 'object' ? getId(sub.branch) : sub.branch;
            return subBranch === getId(branch);
          }
          return false;
        });

        setCategories(filteredCategories);
        setSubcategories(filteredSubcategories);
        setItems(itemsData);
        
        if (filteredCategories.length > 0) {
          setVisibleCategory(filteredCategories[0]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchData();
  }, [branch]);

  const filteredItems = items;

  const getSubcategoriesByCategory = (categoryId) => {
    return subcategories.filter((sub) => {
      let subCatId = null;
      if (sub.category && typeof sub.category === 'object') {
        subCatId = getId(sub.category);
      } else {
        subCatId = sub.category;
      }
      return subCatId === categoryId;
    });
  };

  const getItemsByCategory = (categoryId) => {
    return filteredItems.filter((item) => {
      let itemCatId = null;
      if (item.category && typeof item.category === 'object') {
        itemCatId = getId(item.category);
      } else {
        itemCatId = item.category;
      }
      return itemCatId === categoryId;
    });
  };

  const handleSectionVisible = (category) => {
    setVisibleCategory((prev) => {
      if (!prev || getId(prev._id) !== getId(category._id)) {
        return category;
      }
      return prev;
    });
  };

  return (
    <>
      <DeliveryPickupModal />

      <main className="min-h-screen bg-white text-black relative pb-0">
        <Hero />
        <Navbar />
        <MenuTabs 
          categories={categories} 
          visibleCategory={visibleCategory}
        />
        
        {loading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 w-full bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            {categories.length > 0 ? (
              categories.map(category => {
                const categoryId = getId(category._id);
                const categorySubcategories = getSubcategoriesByCategory(categoryId);
                const categoryItems = getItemsByCategory(categoryId);
                
                return (
                  <MenuSection 
                    key={categoryId}
                    category={category}
                    subcategories={categorySubcategories}
                    items={categoryItems}
                    onSectionVisible={handleSectionVisible}
                  />
                );
              })
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-700">No menu categories available</h2>
                <p className="mt-4 text-gray-500">Please check back later or contact the restaurant.</p>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Button */}
        <div className="fixed bottom-24 sm:bottom-6 right-6 z-[101]">
          <button
            onClick={handleWhatsAppClick}
            className="w-16 h-16 bg-[rgb(42,168,26)] rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
            aria-label="WhatsApp"
          >
            <img
              src="/whatsapp.png"
              alt="WhatsApp"
              className="w-10 h-10 object-contain"
            />
          </button>
        </div>

        {/* Cart Button */}
        <CartButton />

        <div className="mt-10">
        <Footer />
        </div>
      </main>

      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ 
          bottom: '80px',
          width: 'auto',
          maxWidth: '90%'
        }}
        toastStyle={{
          backgroundColor: '#1f2937',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          minHeight: '48px'
        }}
      />
    </>
  );
}