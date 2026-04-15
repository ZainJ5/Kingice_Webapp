import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import FoodItem from "@/app/models/FoodItem";
import Category from "@/app/models/Category";
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

export async function DELETE(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const foodItem = await FoodItem.findById(id);
    if (!foodItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    await FoodItem.findByIdAndDelete(id);
    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ message: "Failed to delete item", error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const previousPrice = formData.get("previousPrice");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const branch = formData.get("branch");
    const isAvailable = formData.get("isAvailable") === 'true';

    if (category) {
      const subcategoriesCount = await Subcategory.countDocuments({ category });
      if (subcategoriesCount > 0 && (!subcategory || subcategory === "")) {
        return NextResponse.json(
          { message: "Subcategory is required for this category" },
          { status: 400 }
        );
      }
    }

    let variationsParsed = [];
    const variations = formData.get("variations");
    if (variations) {
      try {
        variationsParsed = JSON.parse(variations);
      } catch (err) {
        console.error("Error parsing variations:", err);
      }
    }

    let extrasParsed = [];
    const extras = formData.get("extras");
    if (extras) {
      try {
        extrasParsed = JSON.parse(extras);
        
        for (let i = 0; i < extrasParsed.length; i++) {
          const extraImageField = `extraImage_${i}`;
          if (formData.has(extraImageField)) {
            const extraImageUrl = await processFileUpload(formData, extraImageField);
            if (extraImageUrl) {
              extrasParsed[i].imageUrl = extraImageUrl;
            }
          }
        }
      } catch (err) {
        console.error("Error parsing extras:", err);
      }
    }

    let sideOrdersParsed = [];
    const sideOrders = formData.get("sideOrders");
    if (sideOrders) {
      try {
        sideOrdersParsed = JSON.parse(sideOrders);
        
        for (let i = 0; i < sideOrdersParsed.length; i++) {
          const sideOrderImageField = `sideOrderImage_${i}`;
          if (formData.has(sideOrderImageField)) {
            const sideOrderImageUrl = await processFileUpload(formData, sideOrderImageField);
            if (sideOrderImageUrl) {
              sideOrdersParsed[i].imageUrl = sideOrderImageUrl;
            }
          }
        }
      } catch (err) {
        console.error("Error parsing sideOrders:", err);
      }
    }

    let imageUrl;
    const file = formData.get("foodImage");
    if (file && file.size > 0) {
      imageUrl = await processFileUpload(formData, "foodImage");
    }

    const updateData = {
      title,
      description,
      category,
      branch,
      variations: variationsParsed,
      extras: extrasParsed,
      sideOrders: sideOrdersParsed,
      isAvailable,
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
      }
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedFoodItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedFoodItem, { status: 200 });
  } catch (error) {
    console.error("Error updating food item:", error);
    return NextResponse.json(
      { message: "Failed to update item", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    
    const foodItem = await FoodItem.findById(id)
      .populate("branch")
      .populate("category")
      .populate("subcategory");
    
    if (!foodItem) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }
    
    return NextResponse.json(foodItem, { status: 200 });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { message: "Failed to fetch item", error: error.message },
      { status: 500 }
    );
  }
}