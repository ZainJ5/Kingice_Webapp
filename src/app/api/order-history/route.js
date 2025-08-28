import connectDB from '../../lib/mongoose'; 
import Order from '../../models/Order';

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({ status: { $in: ['Complete', 'Cancel'] } })
      .sort({ createdAt: -1 })
      .populate('branch');

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}