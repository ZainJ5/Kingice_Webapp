"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function FoodItemList() {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    price: "",
    previousPrice: "",
    applyDiscount: false,
    category: "",
    subcategory: "",
    branch: "",
    variations: [],
  });
  const [editImage, setEditImage] = useState(null);
  const [originalItemData, setOriginalItemData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    branch: "",
    category: "",
    subcategory: "",
    search: "",
    hasDiscount: false,
  });
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetchBranches();
    fetchCategories();
    fetchSubcategories();
    fetchFoodItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, foodItems]);

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await fetch("/api/subcategories");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setSubcategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fooditems");
      const data = await res.json();
      setFoodItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error("Error fetching food items:", error);
      toast.error("Error fetching food items");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...foodItems];
    const { branch, category, subcategory, search, hasDiscount } = filters;

    if (branch) {
      filtered = filtered.filter(
        (item) => extractValue(item.branch?._id || item.branch) === branch
      );
    }
    if (category) {
      filtered = filtered.filter(
        (item) => extractValue(item.category?._id || item.category) === category
      );
    }
    if (subcategory) {
      filtered = filtered.filter(
        (item) =>
          extractValue(item.subcategory?._id || item.subcategory) === subcategory
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }
    if (hasDiscount) {
      filtered = filtered.filter(item => {
        if (item.previousPrice) return true;
        
        if (item.variations && item.variations.length > 0) {
          return item.variations.some(v => v.previousPrice);
        }
        
        return false;
      });
    }

    setFilteredItems(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const resetFilters = () => {
    setFilters({ 
      branch: "", 
      category: "", 
      subcategory: "", 
      search: "",
      hasDiscount: false 
    });
  };

  const deleteFoodItem = async (id) => {
    try {
      const res = await fetch(`/api/fooditems/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Item deleted successfully");
        setFoodItems((prev) =>
          prev.filter((item) => extractValue(item._id) !== id)
        );
        setShowDeleteConfirm(null);
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item");
    }
  };

  const extractValue = (field) => {
    if (typeof field === "object" && field !== null) {
      if (field.$numberInt) return parseInt(field.$numberInt, 10);
      if (field.$oid) return field.$oid;
    }
    return field;
  };

  const handleEditClick = (item) => {
    setOriginalItemData(item);
    const categoryId =
      typeof item.category === "object" && item.category !== null
        ? extractValue(item.category._id)
        : extractValue(item.category);
    const subcategoryId =
      typeof item.subcategory === "object" && item.subcategory !== null
        ? extractValue(item.subcategory._id)
        : extractValue(item.subcategory);
    const branchId =
      typeof item.branch === "object" && item.branch !== null
        ? extractValue(item.branch._id)
        : extractValue(item.branch);
    const variations = item.variations ? item.variations.map(v => ({
      ...v,
      price: String(v.price ?? ""),
      previousPrice: String(v.previousPrice ?? ""),
      applyDiscount: !!v.previousPrice,
    })) : [];
    setEditingItemId(extractValue(item._id));
    setEditData({
      title: item.title ?? "",
      description: item.description ?? "",
      price: String(item.price ?? ""),
      previousPrice: String(item.previousPrice ?? ""),
      applyDiscount: !!item.previousPrice,
      category: categoryId ?? "",
      subcategory: subcategoryId ?? "",
      branch: branchId ?? "",
      variations,
    });
    setEditImage(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditImage(e.target.files[0]);
    }
  };

  const handleVariationChange = (index, field, value) => {
    setEditData((prev) => {
      const updatedVariations = [...prev.variations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value,
      };
      return {
        ...prev,
        variations: updatedVariations,
      };
    });
  };

  const toggleVariationDiscount = (index, checked) => {
    setEditData((prev) => {
      const updatedVariations = [...prev.variations];
      updatedVariations[index].applyDiscount = checked;
      if (!checked) {
        updatedVariations[index].previousPrice = "";
      } else if (checked && updatedVariations[index].previousPrice === "") {
        const currentPrice = parseFloat(updatedVariations[index].price) || 0;
        updatedVariations[index].previousPrice = (currentPrice * 1.2).toString();
      }
      return {
        ...prev,
        variations: updatedVariations,
      };
    });
  };

  const addVariation = () => {
    setEditData((prev) => ({
      ...prev,
      variations: [...prev.variations, { name: "", price: "", previousPrice: "", applyDiscount: false }],
    }));
  };

  const removeVariation = (index) => {
    setEditData((prev) => {
      const updatedVariations = [...prev.variations];
      updatedVariations.splice(index, 1);
      return {
        ...prev,
        variations: updatedVariations,
      };
    });
  };

  const validatePrices = () => {
    // Validate main item price if discount is applied
    if (editData.applyDiscount) {
      const prevPrice = parseFloat(editData.previousPrice);
      const price = parseFloat(editData.price);
      if (isNaN(prevPrice) || isNaN(price) || prevPrice <= price) {
        toast.error("Original price must be a number higher than discounted price");
        return false;
      }
    }

    // Validate variation prices if they have discounts
    if (editData.variations && editData.variations.length > 0) {
      const validVariations = editData.variations.filter(
        (v) => v.name && v.name.trim() !== "" && v.price !== null && v.price !== undefined
      );
      
      // Check if any variation with discount has invalid prices
      const invalidVariation = validVariations.find(
        (v) => v.applyDiscount && (
          !v.previousPrice ||
          isNaN(parseFloat(v.previousPrice)) ||
          isNaN(parseFloat(v.price)) ||
          parseFloat(v.previousPrice) <= parseFloat(v.price)
        )
      );
      
      if (invalidVariation) {
        toast.error(`Original price must be a number higher than discounted price for variation "${invalidVariation.name}"`);
        return false;
      }
    }

    return true;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItemId) return;

    if (!validatePrices()) {
      return;
    }

    const formData = new FormData();
    formData.append("title", editData.title);
    formData.append("description", editData.description);

    if (!editData.variations || editData.variations.length === 0) {
      formData.append("price", editData.price);
      
      if (editData.applyDiscount && editData.previousPrice) {
        formData.append("previousPrice", editData.previousPrice);
      }
    }

    const categoryId =
      editData.category ||
      (originalItemData &&
      typeof originalItemData.category === "object" &&
      originalItemData.category?._id
        ? extractValue(originalItemData.category._id)
        : extractValue(originalItemData?.category));
    const subcategoryId =
      editData.subcategory ||
      (originalItemData &&
      typeof originalItemData.subcategory === "object" &&
      originalItemData.subcategory?._id
        ? extractValue(originalItemData.subcategory._id)
        : extractValue(originalItemData?.subcategory));
    const branchId =
      editData.branch ||
      (originalItemData &&
      typeof originalItemData.branch === "object" &&
      originalItemData.branch?._id
        ? extractValue(originalItemData.branch._id)
        : extractValue(originalItemData?.branch));

    formData.append("category", categoryId);
    if (subcategoryId) formData.append("subcategory", subcategoryId);
    formData.append("branch", branchId);

    if (editData.variations && editData.variations.length > 0) {
      const validVariations = editData.variations
        .filter((v) => v.name && v.name.trim() !== "" && v.price !== null && v.price !== undefined)
        .map((v) => {
          const varData = { name: v.name, price: v.price };
          if (v.applyDiscount && v.previousPrice) {
            varData.previousPrice = v.previousPrice;
          }
          return varData;
        });
      
      if (validVariations.length > 0) {
        formData.append("variations", JSON.stringify(validVariations));
      }
    }

    if (editImage) formData.append("foodImage", editImage);

    try {
      const res = await fetch(`/api/fooditems/${editingItemId}`, {
        method: "PATCH",
        body: formData,
      });
      if (res.ok) {
        toast.success("Item updated successfully");
        setEditingItemId(null);
        setEditData({
          title: "",
          description: "",
          price: "",
          previousPrice: "",
          applyDiscount: false,
          category: "",
          subcategory: "",
          branch: "",
          variations: [],
        });
        setOriginalItemData(null);
        setEditImage(null);
        fetchFoodItems();
      } else {
        const errorData = await res.json();
        toast.error(`Failed to update item: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Error updating item");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditData({
      title: "",
      description: "",
      price: "",
      previousPrice: "",
      applyDiscount: false,
      category: "",
      subcategory: "",
      branch: "",
      variations: [],
    });
    setOriginalItemData(null);
    setEditImage(null);
  };

  const hasVariationDiscount = (variation) => {
    return variation.previousPrice && variation.previousPrice > variation.price;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600 animate-pulse">Loading food items...</p>
    </div>
  );
  if (foodItems.length === 0) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg text-gray-600">No food items available.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Filter Items</h2>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title or description"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            name="branch"
            value={filters.branch}
            onChange={handleFilterChange}
            className="flex-1 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={extractValue(branch._id)} value={extractValue(branch._id)}>
                {branch.name}
              </option>
            ))}
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="flex-1 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={extractValue(category._id)} value={extractValue(category._id)}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="subcategory"
            value={filters.subcategory}
            onChange={handleFilterChange}
            className="flex-1 py-2 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all duration-300"
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={extractValue(subcategory._id)} value={extractValue(subcategory._id)}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasDiscount"
              name="hasDiscount"
              checked={filters.hasDiscount}
              onChange={handleFilterChange}
              className="mr-2"
            />
            <label htmlFor="hasDiscount" className="text-sm text-gray-700">
              Discounted Items Only
            </label>
          </div>
          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.map((item) => {
          const id = extractValue(item._id);
          const price = extractValue(item.price);
          const previousPrice = extractValue(item.previousPrice);
          const hasDiscount = previousPrice && previousPrice > price;

          if (editingItemId === id) {
            return (
              <div key={id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editData.title}
                      onChange={handleEditChange}
                      placeholder="Title"
                      className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={editData.description}
                      onChange={handleEditChange}
                      placeholder="Description"
                      className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm py-2 px-3"
                    ></textarea>
                  </div>
                  
                  {(!editData.variations || editData.variations.length === 0) && (
                    <>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="applyDiscount"
                          name="applyDiscount"
                          checked={editData.applyDiscount}
                          onChange={handleEditChange}
                          className="mr-2"
                        />
                        <label htmlFor="applyDiscount" className="text-sm font-medium text-gray-700">
                          Apply Discount to Item
                        </label>
                      </div>
                      
                      {editData.applyDiscount ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Original Price</label>
                            <input
                              type="number"
                              name="previousPrice"
                              value={editData.previousPrice}
                              onChange={handleEditChange}
                              placeholder="Original price before discount"
                              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm py-2 px-3"
                              required={editData.applyDiscount}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Discounted Price</label>
                            <input
                              type="number"
                              name="price"
                              value={editData.price}
                              onChange={handleEditChange}
                              placeholder="Current discounted price"
                              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm py-2 px-3"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            type="number"
                            name="price"
                            value={editData.price}
                            onChange={handleEditChange}
                            placeholder="Price"
                            className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm py-2 px-3"
                            required
                          />
                        </div>
                      )}
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category ID (not editable)</label>
                    <input
                      type="text"
                      name="category"
                      value={editData.category}
                      disabled
                      className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-sm py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subcategory ID (not editable)</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={editData.subcategory}
                      disabled
                      className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-sm py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch ID (not editable)</label>
                    <input
                      type="text"
                      name="branch"
                      value={editData.branch}
                      disabled
                      className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-100 text-sm py-2 px-3"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">Variations</h3>
                      <button
                        type="button"
                        onClick={addVariation}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm"
                      >
                        Add Variation
                      </button>
                    </div>
                    {editData.variations && editData.variations.length > 0 ? (
                      <div className="space-y-3">
                        {editData.variations.map((variation, index) => (
                          <div
                            key={index}
                            className="p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`applyDiscountVar${index}`}
                                checked={variation.applyDiscount}
                                onChange={(e) => toggleVariationDiscount(index, e.target.checked)}
                                className="mr-2"
                              />
                              <label htmlFor={`applyDiscountVar${index}`} className="text-sm font-medium text-gray-700">
                                Apply Discount to Variation
                              </label>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <input
                                type="text"
                                value={variation.name || ""}
                                onChange={(e) => handleVariationChange(index, "name", e.target.value)}
                                placeholder="Variation Name"
                                className="flex-1 border p-2 rounded-lg min-w-[150px] text-sm"
                              />
                              
                              {variation.applyDiscount ? (
                                <>
                                  <input
                                    type="number"
                                    value={variation.previousPrice}
                                    onChange={(e) => handleVariationChange(index, "previousPrice", e.target.value)}
                                    placeholder="Original Price"
                                    className="w-24 border p-2 rounded-lg text-sm"
                                  />
                                  <input
                                    type="number"
                                    value={variation.price}
                                    onChange={(e) => handleVariationChange(index, "price", e.target.value)}
                                    placeholder="Discounted Price"
                                    className="w-24 border p-2 rounded-lg text-sm"
                                  />
                                </>
                              ) : (
                                <input
                                  type="number"
                                  value={variation.price}
                                  onChange={(e) => handleVariationChange(index, "price", e.target.value)}
                                  placeholder="Price"
                                  className="w-24 border p-2 rounded-lg text-sm"
                                />
                              )}
                              
                              <button
                                type="button"
                                onClick={() => removeVariation(index)}
                                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all duration-300 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No variations added</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Update Image (optional)
                    </label>
                    <input
                      type="file"
                      name="foodImage"
                      onChange={handleImageChange}
                      className="mt-1 block w-full rounded-lg border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div
              key={id}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start gap-4 ${
                hasDiscount ? 'border-l-4 border-red-500' : ''
              }`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                  {hasDiscount && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Discounted
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                
                {(!item.variations || item.variations.length === 0) && (
                  <div className="mt-2">
                    {hasDiscount ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500">{previousPrice} Rs</span>
                        <span className="font-semibold text-red-600">{price} Rs</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          {Math.round((1 - (price / previousPrice)) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <p className="font-semibold text-gray-800">{price} Rs</p>
                    )}
                  </div>
                )}
                
                {item.branch &&
                typeof item.branch === "object" &&
                item.branch.name ? (
                  <p className="text-xs text-gray-500 mt-1">Branch: {item.branch.name}</p>
                ) : (
                  item.branch && (
                    <p className="text-xs text-gray-500 mt-1">
                      Branch: {extractValue(item.branch)}
                    </p>
                  )
                )}
                {item.category &&
                typeof item.category === "object" &&
                item.category.name ? (
                  <p className="text-xs text-gray-500 mt-1">Category: {item.category.name}</p>
                ) : (
                  item.category && (
                    <p className="text-xs text-gray-500 mt-1">
                      Category: {extractValue(item.category)}
                    </p>
                  )
                )}
                {item.subcategory &&
                typeof item.subcategory === "object" &&
                item.subcategory.name ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Subcategory: {item.subcategory.name}
                  </p>
                ) : (
                  item.subcategory && (
                    <p className="text-xs text-gray-500 mt-1">
                      Subcategory: {extractValue(item.subcategory)}
                    </p>
                  )
                )}
                {item.variations && item.variations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold text-gray-800 text-sm">Variations:</p>
                    <ul className="list-disc pl-4 text-sm text-gray-600">
                      {item.variations.map((variation, index) => {
                        const varPrice = extractValue(variation.price);
                        const varPrevPrice = extractValue(variation.previousPrice);
                        const hasVarDiscount = varPrevPrice && varPrevPrice > varPrice;
                        
                        return (
                          <li key={index} className={hasVarDiscount ? "text-red-600" : ""}>
                            {variation.name} - {hasVarDiscount ? (
                              <>
                                <span className="line-through text-gray-500">{varPrevPrice} Rs</span>{" "}
                                {varPrice} Rs{" "}
                                <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                  {Math.round((1 - (varPrice / varPrevPrice)) * 100)}% OFF
                                </span>
                              </>
                            ) : (
                              `${varPrice} Rs`
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(item)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFoodItem(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}