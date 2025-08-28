import { NextResponse } from "next/server";
import connectDB from "../../lib/mongoose";
import Order from "../../models/Order"; 
import mongoose from "mongoose"; 

function getDateFromPeriod(period) {
  const now = new Date();

  if (period === "1") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (period === "7") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
  if (period === "30") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period"); 

    if (!period) {
      return NextResponse.json(
        { success: false, message: "Please provide a period (1, 7, or 30)" },
        { status: 400 }
      );
    }

    const startDate = getDateFromPeriod(period);
    if (!startDate) {
      return NextResponse.json(
        { success: false, message: "Invalid period. Use 1, 7, or 30" },
        { status: 400 }
      );
    }

    const orders = await Order.find({ createdAt: { $gte: startDate } }).lean();

    return NextResponse.json({
      success: true,
      period: period,
      count: orders.length,
      total: orders.reduce((acc, o) => acc + o.total, 0),
      orders,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const period = body.period;

    if (!period) {
      return NextResponse.json(
        { success: false, message: "Please provide a period (1, 7, or 30)" },
        { status: 400 }
      );
    }

    const startDate = getDateFromPeriod(period);
    if (!startDate) {
      return NextResponse.json(
        { success: false, message: "Invalid period. Use 1, 7, or 30" },
        { status: 400 }
      );
    }

    const orders = await Order.find({ createdAt: { $gte: startDate } }).lean();

    return NextResponse.json({
      success: true,
      period: period,
      count: orders.length,
      total: orders.reduce((acc, o) => acc + o.total, 0),
      orders,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
