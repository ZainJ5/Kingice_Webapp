'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { Eye, ChevronLeft, ChevronRight, Printer, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { Toaster } from 'react-hot-toast';
import OrderDetailsModal from "./OrderDetailsModal";

import kitchenSlipTemplate from '../../templates/kitchen-slip';
import deliveryPreBillTemplate from '../../templates/delivery-pre-bill';
import paymentReceiptTemplate from '../../templates/payment-receipt';

const extractValue = (field) => {
  if (typeof field === "object" && field !== null) {
    if (field.$numberInt) return parseInt(field.$numberInt, 10);
    if (field.$numberLong) return parseInt(field.$numberLong, 10);
    if (field.$oid) return field.$oid;
    if (field.$date) {
      if (typeof field.$date === "object" && field.$date.$numberLong) {
        return new Date(parseInt(field.$date.$numberLong, 10));
      } else {
        return new Date(field.$date);
      }
    }
  }
  return field;
};

const parseItemName = (itemName) => {
  try {
    if (!itemName || typeof itemName !== 'string') {
      return { quantity: 1, cleanName: itemName || 'Unknown Item' };
    }

    const endPattern = /\s*x(\d+)\s*$/i;
    const startPattern = /^(\d+)x\s*/i;

    let quantity = 1;
    let cleanName = itemName.trim();

    const endMatch = cleanName.match(endPattern);
    if (endMatch) {
      quantity = parseInt(endMatch[1], 10) || 1;
      cleanName = cleanName.replace(endPattern, '').trim();
    } else {
      const startMatch = cleanName.match(startPattern);
      if (startMatch) {
        quantity = parseInt(startMatch[1], 10) || 1;
        cleanName = cleanName.replace(startPattern, '').trim();
      }
    }

    return { quantity, cleanName };
  } catch (error) {
    console.error('Error parsing item name:', error);
    return { quantity: 1, cleanName: itemName || 'Unknown Item' };
  }
};

const extractAreaFromAddress = (deliveryAddress) => {
  if (!deliveryAddress) return null;

  const parts = deliveryAddress.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  return null;
};

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="p-2 border w-24"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
    <td className="p-2 border"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="p-2 border text-center"><div className="h-5 w-5 bg-gray-200 rounded-full mx-auto"></div></td>
    <td className="p-2 border text-center"><div className="h-5 w-5 bg-gray-200 rounded-full mx-auto"></div></td>
  </tr>
);

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [orderNumbers, setOrderNumbers] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const ordersPerPage = 10;

  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [pageCache, setPageCache] = useState({});
  const [cacheKey, setCacheKey] = useState("");
  const [deliveryAreas, setDeliveryAreas] = useState([]);

  const { latestOrder, notifications } = useSocket();

  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    imageUrl: ""
  });

  useEffect(() => {
    const fetchDeliveryAreas = async () => {
      try {
        const res = await fetch("/api/delivery-areas");
        if (res.ok) {
          const data = await res.json();
          setDeliveryAreas(data);
        }
      } catch (error) {
        console.error("Error fetching delivery areas:", error);
      }
    };

    fetchDeliveryAreas();
  }, []);

  const getDeliveryFeeForArea = useCallback((areaName) => {
    if (!areaName || !deliveryAreas.length) return 0;

    const area = deliveryAreas.find(
      area => area.name.toLowerCase() === areaName.toLowerCase()
    );

    return area ? area.fee : 0;
  }, [deliveryAreas]);

  const generateCacheKey = useCallback(() => {
    return `${dateFilter}-${customDate || 'none'}-${typeFilter}`;
  }, [dateFilter, customDate, typeFilter]);

  useEffect(() => {
    const newCacheKey = generateCacheKey();
    if (newCacheKey !== cacheKey) {
      setPageCache({});
      setCacheKey(newCacheKey);
      setCurrentPage(1);
    }
  }, [dateFilter, customDate, typeFilter, cacheKey, generateCacheKey]);

  useEffect(() => {
    if (latestOrder) {
      fetchOrders(1, true);
    }
  }, [latestOrder]);

  useEffect(() => {
    if (notifications.length > 0 && currentPage === 1) {
      fetchOrders(1, true);
    }
  }, [notifications.length]);

  const fetchOrders = useCallback(async (page = 1, forceRefresh = false) => {
    const currentCacheKey = generateCacheKey();

    setError(null);

    const cacheEntry = !forceRefresh ? pageCache[`${currentCacheKey}-${page}`] : null;

    if (cacheEntry) {
      console.log(`Using cached data for page ${page}`);
      setOrders(cacheEntry.orders);
      setTotalOrders(cacheEntry.totalCount);
      setTotalPages(cacheEntry.totalPages);
      setOrderNumbers(cacheEntry.orderNumbers);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: ordersPerPage,
        dateFilter,
        typeFilter,
      });

      if (dateFilter === "custom" && customDate) {
        params.append("customDate", customDate);
      }

      const controller = new AbortController();
      const signal = controller.signal;

      if (forceRefresh) {
        params.append("_t", Date.now());
      }

      const res = await fetch(`/api/orders?${params.toString()}`, { signal });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();

      if (data && Array.isArray(data.orders)) {
        const mapping = {};
        data.orders.forEach((order, index) => {
          const idVal = String(extractValue(order._id));
          const globalIndex = (page - 1) * ordersPerPage + index;
          mapping[idVal] = "king-" + (globalIndex + 1).toString().padStart(3, "0");
        });

        setOrders(data.orders);
        setTotalOrders(data.totalCount || data.orders.length);
        setTotalPages(data.totalPages || Math.ceil(data.totalCount / ordersPerPage));
        setOrderNumbers(mapping);

        setPageCache(prev => ({
          ...prev,
          [`${currentCacheKey}-${page}`]: {
            orders: data.orders,
            totalCount: data.totalCount || data.orders.length,
            totalPages: data.totalPages || Math.ceil(data.totalCount / ordersPerPage),
            orderNumbers: mapping,
            timestamp: Date.now()
          }
        }));
      } else {
        console.error("Expected an array of orders but got:", data);
        setError("Invalid data received from server");
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching orders:", error);
        setError(`Failed to fetch orders: ${error.message}`);
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, customDate, typeFilter, ordersPerPage, pageCache, generateCacheKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(currentPage);
    return () => controller.abort();
  }, [fetchOrders, currentPage]);

  const [orderDetailsCache, setOrderDetailsCache] = useState({});

  const fetchOrderDetails = useCallback(async (orderId) => {
    if (orderDetailsCache[orderId]) {
      return orderDetailsCache[orderId];
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        console.error("Failed to fetch order details");
        return null;
      }
      const order = await res.json();

      setOrderDetailsCache(prev => ({
        ...prev,
        [orderId]: order
      }));

      return order;
    } catch (error) {
      console.error("Error fetching order details:", error);
      return null;
    }
  }, [orderDetailsCache]);

  const toggleCompletion = useCallback(async (orderId, currentStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!res.ok) {
        console.error("Failed to update order completion");
        return;
      }

      const updatedOrder = await res.json();

      setOrders(prev =>
        prev.map(order =>
          String(extractValue(order._id)) === orderId ? updatedOrder : order
        )
      );

      setPageCache(prevCache => {
        const updatedCache = { ...prevCache };

        Object.keys(updatedCache).forEach(key => {
          if (updatedCache[key] && updatedCache[key].orders) {
            updatedCache[key].orders = updatedCache[key].orders.map(order =>
              String(extractValue(order._id)) === orderId ? updatedOrder : order
            );
          }
        });

        return updatedCache;
      });

      setOrderDetailsCache(prev => ({
        ...prev,
        [orderId]: updatedOrder
      }));

      if (selectedOrder && String(extractValue(selectedOrder._id)) === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  }, [selectedOrder]);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete order. Status:", res.status);
        return;
      }

      setOrders(prev =>
        prev.filter(order => String(extractValue(order._id)) !== orderId)
      );

      setPageCache(prevCache => {
        const updatedCache = { ...prevCache };

        Object.keys(updatedCache).forEach(key => {
          if (updatedCache[key] && updatedCache[key].orders) {
            updatedCache[key].orders = updatedCache[key].orders.filter(order =>
              String(extractValue(order._id)) !== orderId
            );
            if (updatedCache[key].totalCount > 0) {
              updatedCache[key].totalCount -= 1;
            }
          }
        });

        return updatedCache;
      });

      setOrderDetailsCache(prev => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });

      setTotalOrders(prev => Math.max(0, prev - 1));

      if (selectedOrder && String(extractValue(selectedOrder._id)) === orderId) {
        setSelectedOrder(null);
      }

      const newTotalPages = Math.ceil((totalOrders - 1) / ordersPerPage);
      if (currentPage > newTotalPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }, [selectedOrder, totalOrders, currentPage, ordersPerPage]);

  const handlePageChange = useCallback((pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo(0, 0);
  }, []);

  const viewOrderDetails = useCallback(async (order) => {
    if (!order.items) {
      setSelectedOrder(order);
      setModalLoading(true);
      const fullOrder = await fetchOrderDetails(String(extractValue(order._id)));
      setModalLoading(false);
      if (fullOrder) {
        setSelectedOrder(fullOrder);
      }
    } else {
      setSelectedOrder(order);
      setModalLoading(false);
    }
  }, [fetchOrderDetails]);

  const closeModal = useCallback(() => setSelectedOrder(null), []);

  const openReceiptModal = useCallback((imageUrl) => {
    setReceiptModal({
      isOpen: true,
      imageUrl
    });
  }, []);

  const closeReceiptModal = useCallback(() => {
    setReceiptModal({
      isOpen: false,
      imageUrl: ""
    });
  }, []);

  const paginationPages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, arr) => arr.indexOf(page) === index);
  }, [currentPage, totalPages]);

  const printKitchenSlip = useCallback(async (order) => {
    let orderToPrint = order;

    if (!order.items) {
      const fullOrder = await fetchOrderDetails(String(extractValue(order._id)));
      if (!fullOrder) {
        console.error("Could not fetch order details for kitchen slip");
        return;
      }
      orderToPrint = fullOrder;
    }

    const idVal = String(extractValue(orderToPrint._id));
    const orderNumber = orderNumbers[idVal] || `king-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
    const ticketNumber = Math.floor(10000 + Math.random() * 90000);
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const orderType = orderToPrint.orderType?.charAt(0).toUpperCase() + orderToPrint.orderType?.slice(1) || 'Delivery';

    const itemsList = orderToPrint.items.map((item, index) => {
      const { quantity, cleanName } = parseItemName(item.name);

      return `
        <tr>
          <td style="padding: 3px 0; border-top: 1px dashed #aaa;">${cleanName}</td>
          <td style="padding: 3px 0; border-top: 1px dashed #aaa; text-align: center;">${quantity}</td>
        </tr>
      `;
    }).join('');

    // Use template and replace placeholders
    let htmlContent = kitchenSlipTemplate
      .replace(/{{ticketNumber}}/g, ticketNumber)
      .replace(/{{orderNumber}}/g, orderNumber)
      .replace(/{{currentDate}}/g, currentDate)
      .replace(/{{currentTime}}/g, currentTime)
      .replace(/{{orderType}}/g, orderType)
      .replace(/{{itemsList}}/g, itemsList);

    const newWindow = window.open("", "_blank", "width=300,height=600");
    if (!newWindow) {
      console.error("Couldn't open new window for kitchen slip printing");
      return;
    }

    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }, [fetchOrderDetails, orderNumbers]);

  const printDeliveryPreBill = useCallback(async (order) => {
    let orderToPrint = order;

    if (!order.items) {
      const fullOrder = await fetchOrderDetails(String(extractValue(order._id)));
      if (!fullOrder) {
        alert("Could not fetch order details for printing");
        return;
      }
      orderToPrint = fullOrder;
    }

    const idVal = String(extractValue(orderToPrint._id));
    const orderNumber = orderNumbers[idVal] || `king-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderType = orderToPrint.orderType?.charAt(0).toUpperCase() + orderToPrint.orderType?.slice(1) || 'Delivery';
    const customerName = orderToPrint.fullName || '';
    const mobileNumber = orderToPrint.mobileNumber || '';
    const deliveryAddress = orderToPrint.deliveryAddress || '';
    const paymentInstructions = orderToPrint.paymentInstructions || '----';

    const area = orderToPrint.area || extractAreaFromAddress(orderToPrint.deliveryAddress);
    const deliveryFee = orderToPrint.orderType === 'delivery' ?
      getDeliveryFeeForArea(area) : 0;

    const subtotal = extractValue(orderToPrint.subtotal) || 0;
    const tax = extractValue(orderToPrint.tax) || 0;
    const discount = extractValue(orderToPrint.discount) || 0;
    const discountPercentage = orderToPrint.discountPercentage || 0;
    const total = extractValue(orderToPrint.total) || 0;
    const itemCount = orderToPrint.items.length;

    const itemRows = orderToPrint.items.map((item, index) => {
      const { quantity, cleanName } = parseItemName(item.name);
      const price = extractValue(item.price) || 0;
      const amount = price * quantity;

      return `
        <tr>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd;">${index + 1}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd;">${cleanName}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: center;">${quantity}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: right;">${price}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: right;">${amount}</td>
        </tr>
      `;
    }).join('');

    // Use template and replace placeholders
    let htmlContent = deliveryPreBillTemplate
      .replace(/{{orderNumber}}/g, orderNumber)
      .replace(/{{orderType}}/g, orderType)
      .replace(/{{customerName}}/g, customerName)
      .replace(/{{currentDate}}/g, currentDate)
      .replace(/{{currentTime}}/g, currentTime)
      .replace(/{{itemRows}}/g, itemRows)
      .replace(/{{itemCount}}/g, itemCount)
      .replace(/{{subtotal}}/g, subtotal)
      .replace(/{{tax}}/g, tax)
      .replace(/{{deliveryFee}}/g, deliveryFee)
      .replace(/{{discountPercentage}}/g, discountPercentage)
      .replace(/{{discount}}/g, discount)
      .replace(/{{total}}/g, total)
      .replace(/{{mobileNumber}}/g, mobileNumber)
      .replace(/{{deliveryAddress}}/g, deliveryAddress)
      .replace(/{{paymentInstructions}}/g, paymentInstructions);

    const newWindow = window.open("", "_blank", "width=300,height=600");
    if (!newWindow) return;

    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }, [fetchOrderDetails, orderNumbers, getDeliveryFeeForArea]);

  const printDeliveryPaymentReceipt = useCallback(async (order) => {
    let orderToPrint = order;

    if (!order.items) {
      const fullOrder = await fetchOrderDetails(String(extractValue(order._id)));
      if (!fullOrder) {
        alert("Could not fetch order details for printing");
        return;
      }
      orderToPrint = fullOrder;
    }

    const idVal = String(extractValue(orderToPrint._id));
    const orderNumber = orderNumbers[idVal] || `king-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderType = orderToPrint.orderType?.charAt(0).toUpperCase() + orderToPrint.orderType?.slice(1) || 'Delivery';
    const customerName = orderToPrint.fullName || '';
    const mobileNumber = orderToPrint.mobileNumber || '';
    const deliveryAddress = orderToPrint.deliveryAddress || '';
    const paymentInstructions = orderToPrint.paymentInstructions || '----';

    const area = orderToPrint.area || extractAreaFromAddress(orderToPrint.deliveryAddress);
    const deliveryFee = orderToPrint.orderType === 'delivery' ?
      getDeliveryFeeForArea(area) : 0;

    const subtotal = extractValue(orderToPrint.subtotal) || 0;
    const total = extractValue(orderToPrint.total) || 0;
    const paymentMethod = orderToPrint.paymentMethod === 'cod' ? 'Cash' : 'Online Payment';
    const changeRequest = orderToPrint.changeRequest || '0.00';
    const itemCount = orderToPrint.items.length;

    const itemRows = orderToPrint.items.map((item, index) => {
      const { quantity, cleanName } = parseItemName(item.name);
      const price = extractValue(item.price) || 0;
      const amount = price * quantity;

      return `
        <tr>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd;">${index + 1}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd;">${cleanName}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: center;">${quantity}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: right;">${price}</td>
          <td style="padding: 2px 0; border-bottom: 1px dotted #ddd; text-align: right;">${amount}</td>
        </tr>
      `;
    }).join('');

    // Use template and replace placeholders
    let htmlContent = paymentReceiptTemplate
      .replace(/{{orderNumber}}/g, orderNumber)
      .replace(/{{orderType}}/g, orderType)
      .replace(/{{customerName}}/g, customerName)
      .replace(/{{currentDate}}/g, currentDate)
      .replace(/{{currentTime}}/g, currentTime)
      .replace(/{{itemRows}}/g, itemRows)
      .replace(/{{itemCount}}/g, itemCount)
      .replace(/{{subtotal}}/g, subtotal)
      .replace(/{{deliveryFee}}/g, deliveryFee)
      .replace(/{{total}}/g, total)
      .replace(/{{paymentMethod}}/g, paymentMethod)
      .replace(/{{changeRequest}}/g, changeRequest)
      .replace(/{{mobileNumber}}/g, mobileNumber)
      .replace(/{{deliveryAddress}}/g, deliveryAddress)
      .replace(/{{paymentInstructions}}/g, paymentInstructions);

    const newWindow = window.open("", "_blank", "width=300,height=600");
    if (!newWindow) return;

    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }, [fetchOrderDetails, orderNumbers, getDeliveryFeeForArea]);

  const printOrderDetails = useCallback(async (order) => {
    printDeliveryPaymentReceipt(order);
  }, [printDeliveryPaymentReceipt]);

  const refreshOrders = () => {
    fetchOrders(currentPage, true);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Order List</h2>

        <div className="flex items-center">
          <button
            onClick={refreshOrders}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            aria-label="Refresh orders"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="flex gap-2 items-center">
          <label htmlFor="dateFilter" className="font-medium">
            Filter by Date:
          </label>
          <select
            id="dateFilter"
            className="px-3 py-1 border rounded"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              if (e.target.value !== "custom") {
                setCustomDate("");
              }
            }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="custom">Custom</option>
          </select>
          {dateFilter === "custom" && (
            <input
              type="date"
              className="px-3 py-1 border rounded"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
              }}
            />
          )}
        </div>

        <div className="flex gap-2 items-center">
          <label htmlFor="typeFilter" className="font-medium">
            Filter by Type:
          </label>
          <select
            id="typeFilter"
            className="px-3 py-1 border rounded"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
            }}
          >
            <option value="all">All</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      <table className="min-w-full border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border text-left">Sr No</th>
            <th className="p-2 border text-left">Order No</th>
            <th className="p-2 border text-left">Customer Name</th>
            <th className="p-2 border text-left">Type</th>
            <th className="p-2 border text-left w-24">Area</th>
            <th className="p-2 border text-left">Amount</th>
            <th className="p-2 border text-left">Status</th>
            <th className="p-2 border text-left">View</th>
            <th className="p-2 border text-left">Print</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array(ordersPerPage).fill(0).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))
          ) : error ? (
            <tr>
              <td colSpan="9" className="text-center p-4 text-red-500">
                {error}
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center p-4">No orders found.</td>
            </tr>
          ) : (
            orders.map((order, index) => {
              const idVal = String(extractValue(order._id));
              const orderNumber = orderNumbers[idVal] || "king-000";
              const status = order.isCompleted ? "Completed" : "Pending";
              const srNo = ((currentPage - 1) * ordersPerPage + index + 1)
                .toString()
                .padStart(2, "0");
              const orderType = order.orderType
                ? order.orderType.charAt(0).toUpperCase() +
                  order.orderType.slice(1)
                : "Delivery";

              const area = order.area || extractAreaFromAddress(order.deliveryAddress) || "Clifton";

              return (
                <tr key={idVal} className="hover:bg-gray-100">
                  <td className="p-2 border">{srNo}</td>
                  <td className="p-2 border">{orderNumber}</td>
                  <td className="p-2 border">{order.fullName}</td>
                  <td className="p-2 border">{orderType}</td>
                  <td className="p-2 border w-24">{area}</td>
                  <td className="p-2 border">
                    {extractValue(order.total) || 0}/-
                  </td>
                  <td className="p-2 border">
                    <span
                      className={`font-semibold ${
                        order.isCompleted ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      onClick={() => viewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="View order details"
                    >
                      <Eye className="h-5 w-5 inline-block" />
                    </button>
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => printOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="Print order details"
                    >
                      <Printer className="h-5 w-5 inline-block" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 space-x-1">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-md ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {paginationPages.map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-sm font-medium text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium border rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center px-3 py-2 text-sm font-medium border rounded-md ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>
            Showing {((currentPage - 1) * ordersPerPage) + 1} to{" "}
            {Math.min(currentPage * ordersPerPage, totalOrders)} of{" "}
            {totalOrders} orders
          </span>
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      <OrderDetailsModal
        selectedOrder={selectedOrder}
        modalLoading={modalLoading}
        closeModal={closeModal}
        toggleCompletion={toggleCompletion}
        deleteOrder={deleteOrder}
        printKitchenSlip={printKitchenSlip}
        printDeliveryPreBill={printDeliveryPreBill}
        printDeliveryPaymentReceipt={printDeliveryPaymentReceipt}
        openReceiptModal={openReceiptModal}
        receiptModal={receiptModal}
        closeReceiptModal={closeReceiptModal}
        getDeliveryFeeForArea={getDeliveryFeeForArea}
        extractValue={extractValue}
        parseItemName={parseItemName}
        extractAreaFromAddress={extractAreaFromAddress}
      />

      <Toaster position="top-right" />
    </div>
  );
}