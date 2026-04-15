"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function AddFoodItemForm({
  branches,
  categories,
  subcategories,
  addFoodItem,
}) {
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [previousPrice, setPreviousPrice] = useState(""); 
  const [applyDiscount, setApplyDiscount] = useState(false); 
  const [foodImageFile, setFoodImageFile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true); // Added availability state

  const [variations, setVariations] = useState([]);
  const [variationName, setVariationName] = useState("");
  const [variationPrice, setVariationPrice] = useState("");
  const [variationPreviousPrice, setVariationPreviousPrice] = useState(""); 
  const [applyVariationDiscount, setApplyVariationDiscount] = useState(false);
  const [variationImageFile, setVariationImageFile] = useState(null);
  
  // New state for extras
  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState("");
  const [extraDescription, setExtraDescription] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
  const [extraImageFile, setExtraImageFile] = useState(null);

  // New state for side orders
  const [sideOrders, setSideOrders] = useState([]);
  const [sideOrderName, setSideOrderName] = useState("");
  const [sideOrderDescription, setSideOrderDescription] = useState("");
  const [sideOrderPrice, setSideOrderPrice] = useState("");
  const [sideOrderCategory, setSideOrderCategory] = useState("other");
  const [sideOrderImageFile, setSideOrderImageFile] = useState(null);
  
  const [categoryHasSubcategories, setCategoryHasSubcategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (variations.length > 0) {
      setPrice("");
      setPreviousPrice("");
      setApplyDiscount(false);
    }
  }, [variations]);

  useEffect(() => {
    if (selectedBranchId) {
      const filtered = categories.filter((cat) => {
        const branchId =
          typeof cat.branch === "object" ? cat.branch._id : cat.branch;
        return String(branchId) === String(selectedBranchId);
      });
      setFilteredCategories(filtered);
      setSelectedCategoryId("");
      setFilteredSubcategories([]);
      setSelectedSubcategoryId("");
      setCategoryHasSubcategories(false);
    } else {
      setFilteredCategories([]);
      setSelectedCategoryId("");
      setFilteredSubcategories([]);
      setSelectedSubcategoryId("");
      setCategoryHasSubcategories(false);
    }
  }, [selectedBranchId, categories]);

  useEffect(() => {
    if (selectedCategoryId) {
      const filtered = subcategories.filter((sub) => {
        const categoryId =
          typeof sub.category === "object" ? sub.category._id : sub.category;
        return String(categoryId) === String(selectedCategoryId);
      });
      setFilteredSubcategories(filtered);
      setSelectedSubcategoryId("");
      
      setCategoryHasSubcategories(filtered.length > 0);
    } else {
      setFilteredSubcategories([]);
      setSelectedSubcategoryId("");
      setCategoryHasSubcategories(false);
    }
  }, [selectedCategoryId, subcategories]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoodImageFile(e.target.files[0]);
    }
  };
  
  const handleVariationImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVariationImageFile(e.target.files[0]);
    }
  };
  
  const handleExtraImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExtraImageFile(e.target.files[0]);
    }
  };
  
  const handleSideOrderImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSideOrderImageFile(e.target.files[0]);
    }
  };

  const addVariation = () => {
    if (!variationName.trim() || !variationPrice) {
      toast.error("Please provide both variation name and price.");
      return;
    }

    const variation = { 
      name: variationName.trim(), 
      price: parseFloat(variationPrice),
      isAvailable: true
    };

    // Add previousPrice if discount is applied
    if (applyVariationDiscount && variationPreviousPrice && 
        parseFloat(variationPreviousPrice) > parseFloat(variationPrice)) {
      variation.previousPrice = parseFloat(variationPreviousPrice);
    }
    
    // Process variation image if available
    if (variationImageFile) {
      // We're storing the file object directly in the state
      // It will be processed during the form submission
      variation.imageFile = variationImageFile;
    }

    setVariations((prev) => [...prev, variation]);
    setVariationName("");
    setVariationPrice("");
    setVariationPreviousPrice("");
    setApplyVariationDiscount(false);
    setVariationImageFile(null);
  };

  // Function to add an extra item (topping)
  const addExtra = () => {
    if (!extraName.trim() || !extraPrice) {
      toast.error("Please provide both extra name and price.");
      return;
    }

    const extra = {
      name: extraName.trim(),
      price: parseFloat(extraPrice),
      description: extraDescription.trim() || undefined,
    };
    
    // Process extra image if available
    if (extraImageFile) {
      extra.imageFile = extraImageFile;
    }

    setExtras((prev) => [...prev, extra]);
    setExtraName("");
    setExtraDescription("");
    setExtraPrice("");
    setExtraImageFile(null);
  };

  // Function to add a side order
  const addSideOrder = () => {
    if (!sideOrderName.trim() || !sideOrderPrice) {
      toast.error("Please provide both side order name and price.");
      return;
    }

    const sideOrder = {
      name: sideOrderName.trim(),
      price: parseFloat(sideOrderPrice),
      description: sideOrderDescription.trim() || undefined,
      category: sideOrderCategory,
    };
    
    // Process side order image if available
    if (sideOrderImageFile) {
      sideOrder.imageFile = sideOrderImageFile;
    }

    setSideOrders((prev) => [...prev, sideOrder]);
    setSideOrderName("");
    setSideOrderDescription("");
    setSideOrderPrice("");
    setSideOrderCategory("other");
    setSideOrderImageFile(null);
  };

  // Function to remove an extra item
  const removeExtra = (index) => {
    setExtras((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to remove a side order
  const removeSideOrder = (index) => {
    setSideOrders((prev) => prev.filter((_, i) => i !== index));
  };
  
  // Function to remove a variation
  const removeVariation = (index) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  // Function to process and upload files for variations, extras and side orders
  const processAdditionalFiles = async (formData) => {
    // Process variation files
    for (let i = 0; i < variations.length; i++) {
      if (variations[i].imageFile) {
        formData.append(`variationImage_${i}`, variations[i].imageFile);
      }
    }
    
    // Process extra files
    for (let i = 0; i < extras.length; i++) {
      if (extras[i].imageFile) {
        formData.append(`extraImage_${i}`, extras[i].imageFile);
      }
    }
    
    // Process side order files
    for (let i = 0; i < sideOrders.length; i++) {
      if (sideOrders[i].imageFile) {
        formData.append(`sideOrderImage_${i}`, sideOrders[i].imageFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (categoryHasSubcategories && !selectedSubcategoryId) {
      toast.error("This category has subcategories. Please select a subcategory.");
      return;
    }

    const missingMandatory = !selectedBranchId || 
                             !selectedCategoryId || 
                             !title.trim() || 
                             !foodImageFile || 
                             (variations.length === 0 && !price);

    if (missingMandatory) {
      let errorMsg = "Please fill in all mandatory fields: ";
      const missing = [];
      if (!selectedBranchId) missing.push("Branch");
      if (!selectedCategoryId) missing.push("Category");
      if (!title.trim()) missing.push("Item Title");
      if (!foodImageFile) missing.push("Food Image");
      if (variations.length === 0 && !price) missing.push("Price");
      
      errorMsg += missing.join(", ");
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("branch", selectedBranchId);
    formData.append("category", selectedCategoryId);
    if (selectedSubcategoryId) {
      formData.append("subcategory", selectedSubcategoryId);
    }
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("isAvailable", isAvailable); // Added isAvailable field
    
    if (variations.length === 0) {
      formData.append("price", price);
      // Add previousPrice if discount is applied
      if (applyDiscount && previousPrice && parseFloat(previousPrice) > parseFloat(price)) {
        formData.append("previousPrice", previousPrice);
      }
    }
    
    formData.append("foodImage", foodImageFile);
    
    // Process variations
    if (variations.length > 0) {
      // Filter out the imageFile property before JSON stringify
      const variationsForSubmission = variations.map(variation => {
        const { imageFile, ...rest } = variation;
        return rest;
      });
      formData.append("variations", JSON.stringify(variationsForSubmission));
    }
    
    // Add extras and side orders if they exist
    if (extras.length > 0) {
      // Filter out the imageFile property before JSON stringify
      const extrasForSubmission = extras.map(extra => {
        const { imageFile, ...rest } = extra;
        return rest;
      });
      formData.append("extras", JSON.stringify(extrasForSubmission));
    }
    
    if (sideOrders.length > 0) {
      // Filter out the imageFile property before JSON stringify
      const sideOrdersForSubmission = sideOrders.map(sideOrder => {
        const { imageFile, ...rest } = sideOrder;
        return rest;
      });
      formData.append("sideOrders", JSON.stringify(sideOrdersForSubmission));
    }
    
    // Process all additional image files
    await processAdditionalFiles(formData);

    try {
      await addFoodItem(formData);
      toast.success("Food item added successfully!");
      setSelectedBranchId("");
      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      setTitle("");
      setDescription("");
      setPrice("");
      setPreviousPrice("");
      setApplyDiscount(false);
      setFoodImageFile(null);
      setVariations([]);
      setExtras([]);
      setSideOrders([]);
      setIsAvailable(true); // Reset isAvailable to default true
    } catch (error) {
      toast.error("Error adding food item: " + error.message);
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Select Branch</label>
        <select
          required
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">-- Select Branch --</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Select Category</label>
        <select
          required
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full border rounded p-2"
          disabled={!selectedBranchId}
        >
          <option value="">-- Select Category --</option>
          {filteredCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">
          {categoryHasSubcategories 
            ? "Select Subcategory (Required)" 
            : "Select Subcategory (Optional)"}
        </label>
        <select
          value={selectedSubcategoryId}
          onChange={(e) => setSelectedSubcategoryId(e.target.value)}
          className="w-full border rounded p-2"
          disabled={!selectedCategoryId}
          required={categoryHasSubcategories}
        >
          <option value="">
            {categoryHasSubcategories 
              ? "-- Select Subcategory --" 
              : "-- Select Subcategory (Optional) --"}
          </option>
          {filteredSubcategories.map((sub) => (
            <option key={sub._id} value={sub._id}>
              {sub.name}
            </option>
          ))}
        </select>
        {categoryHasSubcategories && (
          <p className="text-sm text-red-600">
            This category has subcategories. You must select one.
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Item Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Enter item title"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Enter description (optional)"
        ></textarea>
      </div>

      {/* Added availability toggle */}
      <div className="flex items-center mb-4 p-3 border rounded bg-gray-50">
        <input
          type="checkbox"
          id="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="mr-2 h-5 w-5"
        />
        <label htmlFor="isAvailable" className="font-medium">
          Item is Available for Order
        </label>
        <div className="ml-2 text-sm text-gray-600">
          {isAvailable ? 
            "(Customers can order this item)" : 
            "(This item will be hidden from customers)"}
        </div>
      </div>

      {variations.length === 0 && (
        <>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="applyDiscount"
              checked={applyDiscount}
              onChange={(e) => setApplyDiscount(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="applyDiscount" className="font-medium">
              Apply Discount to Item
            </label>
          </div>

          {applyDiscount ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Original Price</label>
                <input
                  type="number"
                  value={previousPrice}
                  onChange={(e) => setPreviousPrice(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="Original price before discount"
                  required={applyDiscount}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Discounted Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="Current discounted price"
                  required
                />
                {applyDiscount && previousPrice && price && 
                 parseFloat(previousPrice) <= parseFloat(price) && (
                  <p className="text-sm text-red-600">
                    Discounted price should be lower than the original price
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-medium mb-1">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter price"
                required={variations.length === 0}
              />
            </div>
          )}
        </>
      )}

      <div>
        <label className="block font-medium mb-1">Upload Item Image</label>
        <input
          type="file"
          required
          onChange={handleFileChange}
          className="w-full border rounded p-2"
          accept="image/*"
        />
      </div>

      {/* Variations Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Variations (Optional)</h3>
        
        <div className="mb-2">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="applyVariationDiscount"
              checked={applyVariationDiscount}
              onChange={(e) => setApplyVariationDiscount(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="applyVariationDiscount" className="font-medium">
              Apply Discount to Variation
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={variationName}
              onChange={(e) => setVariationName(e.target.value)}
              placeholder="Variation Name (e.g., Small)"
              className="border rounded p-2"
            />
            
            {applyVariationDiscount ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={variationPreviousPrice}
                  onChange={(e) => setVariationPreviousPrice(e.target.value)}
                  placeholder="Original Price"
                  className="border rounded p-2"
                />
                <input
                  type="number"
                  value={variationPrice}
                  onChange={(e) => setVariationPrice(e.target.value)}
                  placeholder="Discounted Price"
                  className="border rounded p-2"
                />
              </div>
            ) : (
              <input
                type="number"
                value={variationPrice}
                onChange={(e) => setVariationPrice(e.target.value)}
                placeholder="Price"
                className="border rounded p-2"
              />
            )}
            
            <button
              type="button"
              onClick={addVariation}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition col-span-1 md:col-span-2"
            >
              Add Variation
            </button>
          </div>
          {applyVariationDiscount && 
           variationPreviousPrice && variationPrice && 
           parseFloat(variationPreviousPrice) <= parseFloat(variationPrice) && (
            <p className="text-sm text-red-600">
              Discounted price should be lower than the original price
            </p>
          )}
        </div>

        {variations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {variations.map((v, index) => (
              <div key={index} className="flex justify-between border rounded p-3 bg-gray-50">
                <div>
                  <div className="font-medium">{v.name}</div>
                  <div>
                    {v.previousPrice ? (
                      <>
                        <span className="line-through text-gray-500">{v.previousPrice} Rs</span> {v.price} Rs
                      </>
                    ) : (
                      `${v.price} Rs`
                    )}
                  </div>
                  {v.imageFile && (
                    <div className="text-xs text-blue-600 mt-1">
                      Image: {v.imageFile.name}
                    </div>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => removeVariation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extras Section (Toppings) */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Extras / Toppings (Optional)</h3>
        <div className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={extraName}
              onChange={(e) => setExtraName(e.target.value)}
              placeholder="Extra Name (e.g., Extra Cheese)"
              className="border rounded p-2"
            />
            <input
              type="number"
              value={extraPrice}
              onChange={(e) => setExtraPrice(e.target.value)}
              placeholder="Price"
              className="border rounded p-2"
            />
            <textarea
              value={extraDescription}
              onChange={(e) => setExtraDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border rounded p-2 col-span-1 md:col-span-2"
              rows="2"
            ></textarea>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Extra Image (Optional)</label>
              <input
                type="file"
                onChange={handleExtraImageChange}
                className="w-full border rounded p-2"
                accept="image/*"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={addExtra}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Extra
          </button>
        </div>

        {extras.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium">Added Extras:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {extras.map((extra, index) => (
                <div key={index} className="flex justify-between border rounded p-2 bg-gray-50">
                  <div>
                    <div className="font-medium">{extra.name}</div>
                    <div className="text-gray-700">Price: {extra.price} Rs</div>
                    {extra.description && (
                      <div className="text-sm text-gray-600">{extra.description}</div>
                    )}
                    {extra.imageFile && (
                      <div className="text-xs text-blue-600 mt-1">
                        Image: {extra.imageFile.name}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeExtra(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side Orders Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Side Orders (Optional)</h3>
        <div className="mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={sideOrderName}
              onChange={(e) => setSideOrderName(e.target.value)}
              placeholder="Side Order Name (e.g., Coke)"
              className="border rounded p-2"
            />
            <input
              type="number"
              value={sideOrderPrice}
              onChange={(e) => setSideOrderPrice(e.target.value)}
              placeholder="Price"
              className="border rounded p-2"
            />
            <textarea
              value={sideOrderDescription}
              onChange={(e) => setSideOrderDescription(e.target.value)}
              placeholder="Description (optional)"
              className="border rounded p-2"
              rows="2"
            ></textarea>
            <select
              value={sideOrderCategory}
              onChange={(e) => setSideOrderCategory(e.target.value)}
              className="border rounded p-2"
            >
              <option value="drinks">Drinks</option>
              <option value="appetizers">Appetizers</option>
              <option value="desserts">Desserts</option>
              <option value="other">Other</option>
            </select>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Upload Side Order Image (Optional)</label>
              <input
                type="file"
                onChange={handleSideOrderImageChange}
                className="w-full border rounded p-2"
                accept="image/*"
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={addSideOrder}
            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
          >
            Add Side Order
          </button>
        </div>

        {sideOrders.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium">Added Side Orders:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {sideOrders.map((sideOrder, index) => (
                <div key={index} className="flex justify-between border rounded p-2 bg-gray-50">
                  <div>
                    <div className="font-medium">{sideOrder.name}</div>
                    <div className="text-gray-700">Price: {sideOrder.price} Rs</div>
                    <div className="text-sm text-gray-600">
                      Category: {sideOrder.category.charAt(0).toUpperCase() + sideOrder.category.slice(1)}
                    </div>
                    {sideOrder.description && (
                      <div className="text-sm text-gray-600">{sideOrder.description}</div>
                    )}
                    {sideOrder.imageFile && (
                      <div className="text-xs text-blue-600 mt-1">
                        Image: {sideOrder.imageFile.name}
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSideOrder(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </div>
          ) : (
            "Add Food Item"
          )}
        </button>
      </div>
    </form>
  );
}