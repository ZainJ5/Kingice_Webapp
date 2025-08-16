import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongoose";
import Order from "@/app/models/Order";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const id = await params.id;    
    
    // Populate branch information for the full order details
    const order = await Order.findById(id)
      .populate('branch', 'name location contactNumber')
      .lean();
    
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    
    return NextResponse.json(order, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60' 
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const id = await params.id;    
    const updateData = await request.json();
    
    // Validation for status updates
    if (updateData.status === 'Dispatched' && !updateData.riderName) {
      return NextResponse.json(
        { message: "Rider name is required when status is Dispatched" },
        { status: 400 }
      );
    }
    
    if (updateData.status === 'Cancel' && !updateData.cancelReason) {
      return NextResponse.json(
        { message: "Cancel reason is required when status is Cancel" },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    
    // Handle special case for updating items array
    if (updateData.items) {
      // Validate the structure of each item to match the new schema
      for (const item of updateData.items) {
        if (!item.title || !item.price) {
          return NextResponse.json({
            message: "Each order item must have a title and price",
            status: 400
          });
        }
        
        // Validate selected variations, extras, and side orders if present
        if (item.selectedVariation && (!item.selectedVariation.name || !item.selectedVariation.price)) {
          return NextResponse.json({
            message: "Selected variation must have name and price",
            status: 400
          });
        }
        
        if (item.selectedExtras) {
          for (const extra of item.selectedExtras) {
            if (!extra.name || !extra.price) {
              return NextResponse.json({
                message: "Each selected extra must have name and price",
                status: 400
              });
            }
          }
        }
        
        if (item.selectedSideOrders) {
          for (const sideOrder of item.selectedSideOrders) {
            if (!sideOrder.name || !sideOrder.price) {
              return NextResponse.json({
                message: "Each selected side order must have name and price",
                status: 400
              });
            }
          }
        }
      }
      
      // Replace the entire items array
      order.items = updateData.items;
      delete updateData.items;
    }
    
    // Update other fields
    Object.keys(updateData).forEach(key => {
      order[key] = updateData[key];
    });
    
    await order.save();
    
    return NextResponse.json(order.toObject(), { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: "Validation error", 
        errors: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const id = await params.id;
    
    const exists = await Order.exists({ _id: id });
    
    if (!exists) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }
    
    await Order.deleteOne({ _id: id });
    
    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}