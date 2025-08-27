import { useEffect, useState } from "react";

export default function CancelledOrderList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchCancelledOrders();
  }, []);

  const fetchCancelledOrders = async () => {
    try {
      const res = await fetch("/api/cancelled-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Failed to fetch cancelled orders");
      }
    } catch (error) {
      console.error("Error fetching cancelled orders:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* <h2 className="text-xl font-semibold text-gray-900">Cancelled Orders</h2> */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No cancelled orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">Order #{order.orderNo}</h3>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                  Cancelled
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Date: {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Customer: {order.fullName} ({order.mobileNumber}) 
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Cancel Reason: <span className="font-medium">{order.cancelReason}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Total: Rs{order.total.toFixed(2)}
              </p>
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {item.quantity} x {item.title} - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}