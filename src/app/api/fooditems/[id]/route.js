import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import FoodItem from "@/app/models/FoodItem";
import Subcategory from "@/app/models/Subcategory";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = path.join(process.cwd(), 'public/food-items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

async function processFileUpload(formData, fieldName) {
  const file = formData.get(fieldName);
  
  if (!file || file.size === 0) {
    return null;
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `item-${uuidv4()}${path.extname(file.name)}`;
  const filepath = path.join(uploadDir, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  return `/food-items/${filename}`;
}

function deleteImageFile(imageUrl) {
  if (!imageUrl) return;
  
  try {
    const filename = imageUrl.split('/').pop();
    const filepath = path.join(process.cwd(), 'public/food-items', filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`Deleted file: ${filepath}`);
    }
  } catch (error) {
    console.error(`Error deleting image file: ${error}`);
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();
    const { id } = context.params;
    const foodItem = await FoodItem.findById(id);
    
    if (!foodItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    
    if (foodItem.imageUrl) {
      deleteImageFile(foodItem.imageUrl);
    }
    
    if (foodItem.variations) {
      foodItem.variations.forEach(variation => {
        if (variation.imageUrl) deleteImageFile(variation.imageUrl);
      });
    }
    
    if (foodItem.extras) {
      foodItem.extras.forEach(extra => {
        if (extra.imageUrl) deleteImageFile(extra.imageUrl);
      });
    }
    
    if (foodItem.sideOrders) {
      foodItem.sideOrders.forEach(sideOrder => {
        if (sideOrder.imageUrl) deleteImageFile(sideOrder.imageUrl);
      });
    }
    
    await FoodItem.findByIdAndDelete(id);
    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ message: "Failed to delete item" }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await connectDB();
    
    const { id } = context.params;
    const formData = await request.formData();
    
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const previousPrice = formData.get("previousPrice");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const branch = formData.get("branch");
    
    if (category) {
      const subcategoriesCount = await Subcategory.countDocuments({ category });
      
      if (subcategoriesCount > 0 && (!subcategory || subcategory === "")) {
        return NextResponse.json(
          { message: "Subcategory is required for this category" },
          { status: 400 }
        );
      }
    }
    
    const existingItem = await FoodItem.findById(id);
    if (!existingItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    
    let variationsParsed = [];
    const variations = formData.get("variations");
    if (variations) {
      try {
        const parsedData = JSON.parse(variations);
        variationsParsed = [...parsedData];
        
        for (let i = 0; i < variationsParsed.length; i++) {
          const variationImageField = `variationImage_${i}`;
          if (formData.has(variationImageField)) {
            const imageUrl = await processFileUpload(formData, variationImageField);
            if (imageUrl) {
              variationsParsed[i].imageUrl = imageUrl;
            }
          }
        }
        
        if (existingItem.variations) {
          const newVariationIds = new Set(variationsParsed.map(v => v.name));
          existingItem.variations.forEach(oldVar => {
            if (oldVar.imageUrl && !newVariationIds.has(oldVar.name)) {
              deleteImageFile(oldVar.imageUrl);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing variations:", err);
      }
    }
    
    let extrasParsed = [];
    const extras = formData.get("extras");
    if (extras) {
      try {
        const parsedData = JSON.parse(extras);
        extrasParsed = [...parsedData];
        
        for (let i = 0; i < extrasParsed.length; i++) {
          const extraImageField = `extraImage_${i}`;
          if (formData.has(extraImageField)) {
            const imageUrl = await processFileUpload(formData, extraImageField);
            if (imageUrl) {
              extrasParsed[i].imageUrl = imageUrl;
            }
          }
        }
        
        if (existingItem.extras) {
          const newExtraIds = new Set(extrasParsed.map(e => e.name));
          existingItem.extras.forEach(oldExtra => {
            if (oldExtra.imageUrl && !newExtraIds.has(oldExtra.name)) {
              deleteImageFile(oldExtra.imageUrl);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing extras:", err);
      }
    }
    
    let sideOrdersParsed = [];
    const sideOrders = formData.get("sideOrders");
    if (sideOrders) {
      try {
        const parsedData = JSON.parse(sideOrders);
        sideOrdersParsed = [...parsedData];
        
        for (let i = 0; i < sideOrdersParsed.length; i++) {
          const sideOrderImageField = `sideOrderImage_${i}`;
          if (formData.has(sideOrderImageField)) {
            const imageUrl = await processFileUpload(formData, sideOrderImageField);
            if (imageUrl) {
              sideOrdersParsed[i].imageUrl = imageUrl;
            }
          }
        }
        
        if (existingItem.sideOrders) {
          const newSideOrderIds = new Set(sideOrdersParsed.map(so => so.name));
          existingItem.sideOrders.forEach(oldSideOrder => {
            if (oldSideOrder.imageUrl && !newSideOrderIds.has(oldSideOrder.name)) {
              deleteImageFile(oldSideOrder.imageUrl);
            }
          });
        }
      } catch (err) {
        console.error("Error parsing sideOrders:", err);
      }
    }
    
    let imageUrl;
    const file = formData.get("foodImage");
    if (file && file.size > 0) {
      if (existingItem && existingItem.imageUrl) {
        deleteImageFile(existingItem.imageUrl);
      }
      
      imageUrl = await processFileUpload(formData, "foodImage");
    }
    
    const updateData = {
      title,
      description,
      category,
      branch,
      variations: variationsParsed,
      extras: extrasParsed,
      sideOrders: sideOrdersParsed
    };
    
    if (subcategory && subcategory !== "") {
      updateData.subcategory = subcategory;
    } else {
      updateData.subcategory = null;
    }
    
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }
    
    if (!variationsParsed.length) {
      updateData.price = Number(price);
      
      if (previousPrice) {
        updateData.previousPrice = Number(previousPrice);
      } else {
        updateData.previousPrice = undefined;
      }
    }
    
    const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    
    return NextResponse.json(updatedFoodItem, { status: 200 });
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { message: "Failed to update item", error: error.message },
      { status: 500 }
    );
  }
}