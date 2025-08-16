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

  const getCacheBustedUrl = (url) => {
    if (!url) return "";
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  const hasActiveSubcategories = subcategories && subcategories.length > 0 && 
    subcategories.some(sub => {
      return items.some(item => getId(item.subcategory) === getId(sub._id));
    });

  const itemCount = items.length;

  useEffect(() => {
    if (!window.menuSectionTracker) {
      window.menuSectionTracker = {
        sections: new Map(),
        activeId: null,
        updateActiveSection: function() {
          let bestSection = null;
          let bestScore = -1;
          
          this.sections.forEach((sectionData, id) => {
            const { ratio, rect, timestamp } = sectionData;
            if (!ratio || ratio <= 0) return;
            
            const viewportHeight = window.innerHeight;
            const sectionCenter = rect.top + (rect.height / 2);
            const viewportCenter = viewportHeight / 2;
            const distanceFromCenter = Math.abs(sectionCenter - viewportCenter) / (viewportHeight / 2);
            const centeringFactor = 1 - Math.min(1, distanceFromCenter);
            
            const recencyBonus = (Date.now() - timestamp) < 500 ? 0.05 : 0;
            const score = (ratio * 0.6) + (centeringFactor * 0.4) + recencyBonus;
            
            if (score > bestScore) {
              bestScore = score;
              bestSection = sectionData;
            }
          });
          
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

  useEffect(() => {
    if (!sectionRef.current || !window.menuSectionTracker) return;
    
    const categoryId = getId(category._id);
    
    const activateCallback = (cat) => {
      setActiveCategory(categoryId);
      setActiveCategoryName(category.name);
      onSectionVisible(cat);
    };
    
    window.menuSectionTracker.sections.set(categoryId, {
      id: categoryId,
      category,
      ratio: 0,
      rect: null,
      timestamp: Date.now(),
      callback: activateCallback
    });
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        const tracker = window.menuSectionTracker;
        if (!tracker) return;
        
        const sectionData = tracker.sections.get(categoryId);
        if (!sectionData) return;
        
        sectionData.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        sectionData.rect = entry.boundingClientRect;
        sectionData.timestamp = Date.now();
        
        if (!entry.isIntersecting && tracker.activeId === categoryId) {
          sectionData.ratio = 0;
        }
        
        tracker.updateActiveSection();
      });
    };
    
    const observer = new IntersectionObserver(
      observerCallback,
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10% 0px -20% 0px'
      }
    );
    
    observer.observe(sectionRef.current);
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      
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
  
  // Find lowest current price and any discount among variations
  const variationPrices = hasVariations 
    ? item.variations.map(v => {
        const price = Number(getPrice(v.price));
        const previousPrice = v.previousPrice ? Number(getPrice(v.previousPrice)) : null;
        return { price, previousPrice, hasDiscount: previousPrice && previousPrice > price };
      }) 
    : [];
  
  const lowestPriceVariation = variationPrices.length > 0
    ? variationPrices.reduce((lowest, current) => 
        current.price < lowest.price ? current : lowest, 
        variationPrices[0])
    : null;
  
  // Check if the item has a discount (either main price or at least one variation)
  const hasMainItemDiscount = item.previousPrice && Number(getPrice(item.previousPrice)) > Number(getPrice(item.price));
  const hasAnyDiscount = hasMainItemDiscount || (hasVariations && variationPrices.some(v => v.hasDiscount));

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
          previousPrice: selectedVar.previousPrice,  // Include previousPrice if available
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

  const imageUrl = item.imageUrl && item.imageUrl !== '' 
    ? getCacheBustedUrl(item.imageUrl)
    : '';

  // Calculate discount percentage for display
  const calculateDiscountPercentage = (currentPrice, originalPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return null;
    return Math.round((1 - (currentPrice / originalPrice)) * 100);
  };

  const mainItemDiscount = calculateDiscountPercentage(
    Number(getPrice(item.price)), 
    item.previousPrice ? Number(getPrice(item.previousPrice)) : null
  );

  return (
    <>
      <div 
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer 
                    ${hasAnyDiscount ? 'border-2 border-red-500' : ''}`}
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
          
          {hasAnyDiscount && (
            <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-xs font-bold">
              {hasMainItemDiscount ? 
                `${mainItemDiscount}% OFF` : 
                `UP TO ${Math.max(...variationPrices.map(v => 
                  calculateDiscountPercentage(v.price, v.previousPrice) || 0
                ))}% OFF`
              }
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
            {hasVariations ? (
              <div className="flex flex-col">
                {lowestPriceVariation && lowestPriceVariation.hasDiscount ? (
                  <>
                    <span className="text-xs text-gray-500 line-through">
                      Rs.{lowestPriceVariation.previousPrice}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-red-600">
                      Rs.{lowestPriceVariation.price}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-xl font-bold">
                    From Rs.{lowestPriceVariation ? lowestPriceVariation.price : ''}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                {item.previousPrice && Number(getPrice(item.previousPrice)) > Number(getPrice(item.price)) ? (
                  <>
                    <span className="text-xs text-gray-500 line-through">
                      Rs.{getPrice(item.previousPrice)}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-red-600">
                      Rs.{getPrice(item.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-xl font-bold">
                    Rs.{getPrice(item.price)}
                  </span>
                )}
              </div>
            )}
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
              <div className="w-full h-48 mb-4 relative">
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
                
                {hasAnyDiscount && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-sm font-bold rounded-bl-md">
                    {hasMainItemDiscount ? 
                      `${mainItemDiscount}% OFF` : 
                      `UP TO ${Math.max(...variationPrices.map(v => 
                        calculateDiscountPercentage(v.price, v.previousPrice) || 0
                      ))}% OFF`
                    }
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
                    {item.variations.map((variation, index) => {
                      const price = getPrice(variation.price);
                      const previousPrice = variation.previousPrice ? getPrice(variation.previousPrice) : null;
                      const hasDiscount = previousPrice && previousPrice > price;
                      const discountPercentage = hasDiscount 
                        ? calculateDiscountPercentage(Number(price), Number(previousPrice)) 
                        : null;
                        
                      return (
                        <option key={index} value={index}>
                          {variation.name} - {hasDiscount ? 
                            `Rs.${price} (${discountPercentage}% OFF)` : 
                            `Rs.${price}`}
                        </option>
                      );
                    })}
                  </select>
                  
                  {(() => {
                    if (!selectedVariation) return null;
                    const variation = item.variations[Number(selectedVariation)];
                    if (!variation) return null;
                    
                    const price = getPrice(variation.price);
                    const previousPrice = variation.previousPrice ? getPrice(variation.previousPrice) : null;
                    const hasDiscount = previousPrice && previousPrice > price;
                    
                    if (hasDiscount) {
                      return (
                        <div className="mt-2 text-center">
                          <span className="text-lg text-gray-500 line-through mr-2">
                            Rs.{previousPrice}
                          </span>
                          <span className="text-xl font-bold text-red-600">
                            Rs.{price}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div className="w-full mb-4 text-center">
                  {item.previousPrice && Number(getPrice(item.previousPrice)) > Number(getPrice(item.price)) ? (
                    <div>
                      <p className="text-lg text-gray-500 line-through">Original Price: Rs.{getPrice(item.previousPrice)}</p>
                      <p className="text-xl font-bold text-red-600">
                        Discounted Price: Rs.{getPrice(item.price)} 
                        <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          {mainItemDiscount}% OFF
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold">Price: Rs.{getPrice(item.price)}</p>
                  )}
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