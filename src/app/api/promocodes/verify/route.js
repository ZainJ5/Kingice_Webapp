import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import PromoCode from "@/app/models/PromoCode";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    
    if (!code) {
      return NextResponse.json(
        { message: "Promo code is required" },
        { status: 400 }
      );
    }
    
    await connectDB();
    const promoCode = await PromoCode.findOne({ code: code.toUpperCase() });
    
    if (!promoCode) {
      return NextResponse.json(
        { message: "Invalid promo code" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      promoCode.toObject({ getters: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying promo code:", error);
    return NextResponse.json(
      { message: "Failed to verify promo code" },
      { status: 500 }
    );
  }
}