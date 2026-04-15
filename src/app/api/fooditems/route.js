import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import FoodItem from "@/app/models/FoodItem";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Category from "@/app/models/Category";
import Subcategory from "@/app/models/Subcategory";
import Branch from "@/app/models/Branch";

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

export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const previousPrice = formData.get("previousPrice");
    const category = formData.get("category");
    const subcategory = formData.get("subcategory");
    const branch = formData.get("branch");
    const isAvailableValue = formData.get("isAvailable");
    const isAvailable = isAvailableValue === "true" || isAvailableValue === true;
    
    const imageUrl = await processFileUpload(formData, "foodImage");
    if (!imageUrl) {
      return NextResponse.json(
        { message: "Food image is required" },
        { status: 400 }
      );
    }
    
    let variationsParsed = [];
    const variations = formData.get("variations");
    if (variations) {
      try {
        variationsParsed = JSON.parse(variations);
        
        for (let i = 0; i < variationsParsed.length; i++) {
          const variationImageField = `variationImage_${i}`;
          if (formData.has(variationImageField)) {
            const varImageUrl = await processFileUpload(formData, variationImageField);
            if (varImageUrl) {
              variationsParsed[i].imageUrl = varImageUrl;
            }
          }
        }
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
    
    const foodItemData = {
      title,
      description,
      imageUrl,
      category,
      branch,
      isAvailable, 
      variations: variationsParsed,
      extras: extrasParsed,
      sideOrders: sideOrdersParsed
    };
    
    if (subcategory) {
      foodItemData.subcategory = subcategory;
    }
    
    if (!variationsParsed.length) {
      foodItemData.price = Number(price);
      
      if (previousPrice) {
        foodItemData.previousPrice = Number(previousPrice);
      }
    }
    
    const foodItem = await FoodItem.create(foodItemData);
    
    return NextResponse.json(foodItem, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/fooditems:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const filterAvailable = searchParams.get("available");
    
    let query = {};
    
    if (filterAvailable === "true") {
      query.isAvailable = true;
    } else if (filterAvailable === "false") {
      query.isAvailable = false;
    }
    
    const items = await FoodItem.find(query)
      .populate("branch")
      .populate("category")
      .populate("subcategory");
    
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { message: "Failed to fetch items", error: error.message },
      { status: 500 }
    );
  }
}