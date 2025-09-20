import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import Order from "@/app/models/Order";
import StoreSettings from "../../models/StoreSettings";

export async function GET(request) {
  try {
    await connectDB();
    
    const storeSettings = await StoreSettings.findOne().lean();
    
    if (!storeSettings || !storeSettings.isOrdersVisible) {
      return NextResponse.json({
        orders: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        message: "Error! message code 500 Orders are not available"
      }, { status: 500 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const dateFilter = searchParams.get('dateFilter') || 'all';
    const typeFilter = searchParams.get('typeFilter') || 'all';
    const statusFilter = searchParams.get('statusFilter') || 'all';
    const paymentFilter = searchParams.get('paymentFilter') || 'all';
    const customDate = searchParams.get('customDate') || '';
    
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (dateFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.createdAt = { $gte: today, $lt: tomorrow };
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: yesterday, $lt: today };
    } else if (dateFilter === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: selectedDate, $lt: nextDay };
    }
    
    if (typeFilter === 'pickup') {
      filter.orderType = 'pickup';
    } else if (typeFilter === 'delivery') {
      filter.orderType = 'delivery';
    }

    if (statusFilter !== 'all') {
      const statuses = statusFilter.split(',');
      filter.status = { $in: statuses };
    }

    if (paymentFilter === 'cod') {
      filter.paymentMethod = 'cod';
    } else if (paymentFilter === 'online') {
      filter.paymentMethod = 'online';
    } else if (paymentFilter === 'easypaisa') {
      filter.paymentMethod = 'online';
      filter.bankName = { $regex: /easypaisa/i };
    } else if (paymentFilter === 'jazzcash') {
      filter.paymentMethod = 'online';
      filter.bankName = { $regex: /jazzcash/i };
    } else if (paymentFilter === 'bank') {
      filter.paymentMethod = 'online';
      filter.bankName = { $regex: /bank/i };
    }

    const listFields = {
      orderNo: 1,
      fullName: 1, 
      mobileNumber: 1, 
      alternateMobile: 1,
      orderType: 1, 
      total: 1, 
      isCompleted: 1,
      status: 1,
      paymentMethod: 1,
      bankName: 1,
      branch: 1,
      createdAt: 1,
      itemCount: { $size: "$items" }
    };
    
    const totalCount = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .select(listFields)
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit)
      .populate('branch', 'name')
      .lean(); 
    
    const totalPages = Math.ceil(totalCount / limit);
    
    const headers = {
      'Cache-Control': 'private, max-age=30' 
    };
    
    return NextResponse.json({
      orders,
      totalCount,
      totalPages,
      currentPage: page
    }, { 
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }
    
    for (const item of data.items) {
      if (!item.title || !item.price || !item.id || item.quantity === undefined) {
        return NextResponse.json({
          message: "Each order item must have id, title, price, and quantity",
          status: 400
        });
      }
      
      if (item.selectedVariation && 
          (!item.selectedVariation.name || item.selectedVariation.price === undefined)) {
        return NextResponse.json({
          message: "Selected variation must have name and price",
          status: 400
        });
      }
      
      if (item.selectedExtras && Array.isArray(item.selectedExtras)) {
        for (const extra of item.selectedExtras) {
          if (!extra.name || extra.price === undefined) {
            return NextResponse.json({
              message: "Each extra must have name and price",
              status: 400
            });
          }
        }
      }
      
      if (item.selectedSideOrders && Array.isArray(item.selectedSideOrders)) {
        for (const sideOrder of item.selectedSideOrders) {
          if (!sideOrder.name || sideOrder.price === undefined) {
            return NextResponse.json({
              message: "Each side order must have name and price",
              status: 400
            });
          }
        }
      }
    }
    
    if (!data.fullName || !data.mobileNumber || data.subtotal === undefined || 
        data.tax === undefined || data.total === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (!data.branch) {
      return NextResponse.json(
        { message: "Branch ID is required" },
        { status: 400 }
      );
    }
    
    const order = new Order(data);
    await order.save();
    
    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}