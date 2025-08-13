"use client";

import { useEffect, useRef, useState } from 'react';
import { useMenuStore } from '../../store/menu';
import { useCartStore } from '../../store/cart';
import { toast } from 'react-toastify';

export default function MenuSection({ category, subcategories, items, onSectionVisible }) {
  const sectionRef = useRef(null);
  const { setActiveCategory, setActiveCategoryName } = useMenuStore();
  const imageCache = useRef(new Map());
  
  const getId = (idField) => {
    if (typeof idField === 'object' && idField !== null) {
      if (idField.$oid) return idField.$oid;
      if (idField._id) return getId(idField._id);
    }
    return idField;
  };

  // Add cache buster to image URLs
  const getCacheBustedUrl = (url) => {
    if (!url) return "";
    // Check if URL already has parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  // Check if category has subcategories with items
  const hasActiveSubcategories = subcategories && subcategories.length > 0 && 
    subcategories.some(sub => {
      return items.some(item => getId(item.subcategory) === getId(sub._id));
    });

  // Count items for this category
  const itemCount = items.length;

  // Set up global tracking of all active sections if it doesn't exist
  useEffect(() => {
    if (!window.menuSectionTracker) {
      window.menuSectionTracker = {
        sections: new Map(),
        activeId: null,
        updateActiveSection: function() {
          // Calculate which section should be active based on all intersecting sections
          let bestSection = null;
          let bestScore = -1;
          
          this.sections.forEach((sectionData, id) => {
            const { ratio, rect, timestamp } = sectionData;
            if (!ratio || ratio <= 0) return;
            
            // Calculate score based on:
            // 1. Intersection ratio
            // 2. Proximity to the center of the viewport
            // 3. Recency of intersection
            
            // How close the section is to the center of the viewport (0-1, where 1 is centered)
            const viewportHeight = window.innerHeight;
            const sectionCenter = rect.top + (rect.height / 2);
            const viewportCenter = viewportHeight / 2;
            const distanceFromCenter = Math.abs(sectionCenter - viewportCenter) / (viewportHeight / 2);
            const centeringFactor = 1 - Math.min(1, distanceFromCenter);
            
            // Calculate overall score (intersection + centering + small recency bonus)
            const recencyBonus = (Date.now() - timestamp) < 500 ? 0.05 : 0;
            const score = (ratio * 0.6) + (centeringFactor * 0.4) + recencyBonus;
            
            if (score > bestScore) {
              bestScore = score;
              bestSection = sectionData;
            }
          });
          
          // Only update if we found a section and it's different from current
          if (bestSection && bestSection.id !== this.activeId) {
            this.activeId = bestSection.id;
            if (bestSection.callback) {
              bestSection.callback(bestSection.category);
            }
          }
        }
      };
    }
  }, []);

  // Improved intersection observer setup
  useEffect(() => {
    if (!sectionRef.current || !window.menuSectionTracker) return;
    
    const categoryId = getId(category._id);
    
    // Callback when this category becomes active
    const activateCallback = (cat) => {
      setActiveCategory(categoryId);
      setActiveCategoryName(category.name);
      onSectionVisible(cat);
    };
    
    // Register this section with the global tracker
    window.menuSectionTracker.sections.set(categoryId, {
      id: categoryId,
      category,
      ratio: 0,
      rect: null,
      timestamp: Date.now(),
      callback: activateCallback
    });
    
    // Observer callback
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const tracker = window.menuSectionTracker;
        if (!tracker) return;
        
        const sectionData = tracker.sections.get(categoryId);
        if (!sectionData) return;
        
        // Update section data with new intersection info
        sectionData.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        sectionData.rect = entry.boundingClientRect;
        sectionData.timestamp = Date.now();
        
        // If the section is not intersecting at all, it shouldn't be considered
        if (!entry.isIntersecting && tracker.activeId === categoryId) {
          sectionData.ratio = 0;
        }
        
        // Recalculate the active section
        tracker.updateActiveSection();
      });
    };
    
    // Create observer with appropriate thresholds
    const observer = new IntersectionObserver(
      observerCallback,
      {
        // Use multiple thresholds for more precise measurement
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -20% 0px'
      }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      
      // Clean up this section from the global tracker when unmounting
      if (window.menuSectionTracker) {
        window.menuSectionTracker.sections.delete(categoryId);
      }
    };
  }, [category, setActiveCategory, setActiveCategoryName, onSectionVisible]);

  return (
    <div 
      ref={sectionRef} 
      id={`category-${getId(category._id)}`} 
      className="pt-4 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Only show category banner if there are no subcategories */}
        {!hasActiveSubcategories && category.image && (
          <div className="relative w-full h-auto bg-gray-200 rounded-md overflow-hidden mb-6">
            <img 
              src={getCacheBustedUrl(category.image)}
              alt={category.name}
              className="w-full h-auto object-contain rounded-md"
              loading="eager"
              decoding="async"
              onError={(e) => {
                imageCache.current.set(category.image, false);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Display items organized by subcategories */}
        {hasActiveSubcategories ? (
          subcategories.map(subcategory => {
            const subcategoryItems = items.filter(item => 
              getId(item.subcategory) === getId(subcategory._id)
            );
            
            if (subcategoryItems.length === 0) return null;
            
            return (
              <div 
                key={getId(subcategory._id)} 
                id={`subcategory-${getId(subcategory._id)}`} 
                className="mb-12"
              >
                {/* Show subcategory banner image if available */}
                {subcategory.image && (
                  <div className="relative w-full h-auto bg-gray-200 rounded-md overflow-hidden mb-6">
                    <img 
                      src={getCacheBustedUrl(subcategory.image)}
                      alt={subcategory.name}
                      className="w-full h-auto object-contain rounded-md"
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        imageCache.current.set(subcategory.image, false);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {subcategoryItems.map(item => (
                    <MenuItemCard 
                      key={getId(item._id)} 
                      item={item}
                      getCacheBustedUrl={getCacheBustedUrl}
                    />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          // Display items directly under category if no subcategories
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {items.map(item => (
              <MenuItemCard 
                key={getId(item._id)} 
                item={item}
                getCacheBustedUrl={getCacheBustedUrl}
              />
            ))}
          </div>
        )}
        
        {/* Display items that don't belong to any subcategory */}
        {hasActiveSubcategories && (
          (() => {
            const uncategorizedItems = items.filter(item => 
              !subcategories.some(sub => getId(item.subcategory) === getId(sub._id))
            );
            
            if (uncategorizedItems.length === 0) return null;
            
            return (
              <div className="mt-12">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                  {uncategorizedItems.map(item => (
                    <MenuItemCard 
                      key={getId(item._id)} 
                      item={item}
                      getCacheBustedUrl={getCacheBustedUrl}
                    />
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

function MenuItemCard({ item, getCacheBustedUrl }) {
  // MenuItemCard component remains the same as before
  const { addToCart } = useCartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState("");
  const [imageError, setImageError] = useState(false);
  
  const getId = (idField) => {
    if (typeof idField === 'object' && idField !== null) {
      if (idField.$oid) return idField.$oid;
      if (idField._id) return getId(idField._id);
    }
    return idField;
  };

  const getPrice = (priceField) => {
    if (typeof priceField === 'object' && priceField !== null) {
      if (priceField.$numberInt) return priceField.$numberInt;
      if (priceField.$numberDouble) return priceField.$numberDouble;
    }
    return priceField;
  };

  const hasVariations = item.variations && item.variations.length > 0;
  const lowestPrice = hasVariations ? 
    Math.min(...item.variations.map(v => Number(getPrice(v.price)))) : 
    null;

  const handleCardClick = () => {
    setIsModalOpen(true);
    if (hasVariations) {
      setSelectedVariation("0");
    }
  };

  const handleAddDirectly = (e) => {
    e.stopPropagation();
    const cartItemId = `${getId(item._id)}-${Date.now()}`;
    const itemToAdd = { ...item, cartItemId };
    addToCart(itemToAdd);
    toast.success("Item added to cart!", { autoClose: 2000 });
  };

  const handleAddToCart = () => {
    if (hasVariations) {
      const variationIndex = Number(selectedVariation);
      const selectedVar = item.variations[variationIndex];
      if (selectedVar && selectedVar.name && selectedVar.name.trim().length > 0) {
        const cartItemId = `${getId(item._id)}-${selectedVar.name}-${Date.now()}`;
        const itemToAdd = { 
          ...item, 
          price: selectedVar.price, 
          type: selectedVar.name,  
          cartItemId 
        };
        addToCart(itemToAdd);
        toast.success("Item added to cart!", { autoClose: 2000 });
      } else {
        toast.error("Please select a valid variation");
      }
    } else {
      const cartItemId = `${getId(item._id)}-${Date.now()}`;
      const itemToAdd = { ...item, cartItemId };
      addToCart(itemToAdd);
      toast.success("Item added to cart!", { autoClose: 2000 });
    }
    setIsModalOpen(false);
  };

  // Cache-busted image URL
  const imageUrl = item.imageUrl && item.imageUrl !== '' 
    ? getCacheBustedUrl(item.imageUrl)
    : '';

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="h-48 w-full relative">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="object-cover w-full h-full"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="p-2 sm:p-3 md:p-4">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold">{item.title}</h3>
          {item.description && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
              {item.description}
            </p>
          )}
          {Array.isArray(item.items) && item.items.length > 0 && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-1">
              {item.items.join(', ')}
            </p>
          )}
          <div className="mt-2 sm:mt-4 flex justify-between items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold">
              {hasVariations ? `Rs.${lowestPrice}` : `Rs.${getPrice(item.price)}`}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                hasVariations ? handleCardClick() : handleAddDirectly(e);
              }}
              className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg p-6 relative mx-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>
            <div className="flex flex-col items-center">
              <div className="w-full h-48 mb-4">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="object-cover w-full h-full rounded"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              {item.description && (
                <p className="text-gray-700 mb-4 text-center">{item.description}</p>
              )}
              
              {hasVariations ? (
                <div className="w-full mb-4">
                  <label className="block text-gray-700 mb-1">Select Variation:</label>
                  <select
                    value={selectedVariation}
                    onChange={(e) => setSelectedVariation(e.target.value)}
                    className="w-full border rounded p-2"
                  >
                    {item.variations.map((variation, index) => (
                      <option key={index} value={index}>
                        {variation.name} - Rs.{getPrice(variation.price)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="w-full mb-4 text-center">
                  <p className="text-lg font-bold">Price: Rs.{getPrice(item.price)}</p>
                </div>
              )}
              
              <button
                onClick={handleAddToCart}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}