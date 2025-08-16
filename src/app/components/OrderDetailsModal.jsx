import React, { useState, useEffect } from "react";
import { Eye, Printer, CheckCircle, XCircle, Trash2, Save } from "lucide-react";

const OrderDetailsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/5"></div>
    <div className="h-4 bg-gray-200 rounded w-2/5"></div>
    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
    <div className="mt-6">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-10/12"></div>
        <div className="h-4 bg-gray-200 rounded w-9/12"></div>
      </div>
    </div>
    <div className="mt-6 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-2/5 mt-4"></div>
  </div>
);

export default function OrderDetailsModal({
  selectedOrder,
  modalLoading,
  closeModal,
  updateOrderStatus,
  deleteOrder,
  printKitchenSlip,
  printDeliveryPreBill,
  printDeliveryPaymentReceipt,
  openReceiptModal,
  receiptModal,
  closeReceiptModal,
  getDeliveryFeeForArea,
  extractValue,
  parseItemName,
  extractAreaFromAddress,
}) {
  const [status, setStatus] = useState("");
  const [riderName, setRiderName] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [area, setArea] = useState("");

  useEffect(() => {
    if (selectedOrder) {
      setStatus(selectedOrder.status || "Pending");
      setRiderName(selectedOrder.riderName || "");
      setCancelReason(selectedOrder.cancelReason || "");
      
      const extractedArea = selectedOrder.area || 
        (selectedOrder.deliveryAddress ? extractAreaFromAddress(selectedOrder.deliveryAddress) : null);
      
      setArea(extractedArea || "");
    }
  }, [selectedOrder, extractAreaFromAddress]);

  if (!selectedOrder) return null;

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      // Create update data object WITHOUT including _id
      const updateData = { 
        status
      };
      
      if (status === "Dispatched") {
        if (!riderName.trim()) {
          alert("Rider name is required when status is Dispatched");
          setIsUpdating(false);
          return;
        }
        updateData.riderName = riderName;
      }
      
      if (status === "Cancel") {
        if (!cancelReason.trim()) {
          alert("Cancel reason is required when status is Cancel");
          setIsUpdating(false);
          return;
        }
        updateData.cancelReason = cancelReason;
      }
      
      // Use the ID in the URL path, not in the request body
      await updateOrderStatus(selectedOrder._id, updateData);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "In-Process": return "bg-blue-100 text-blue-800";
      case "Dispatched": return "bg-purple-100 text-purple-800";
      case "Complete": return "bg-green-100 text-green-800";
      case "Cancel": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get delivery fee based on area
  const deliveryFee = selectedOrder.orderType === 'delivery' && area ? 
    getDeliveryFeeForArea(area) : 0;

  // Format price with locale string
  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    return Number(price).toLocaleString();
  };

  // Helper to check if an item has any modifications (considering all possible formats)
  const hasModifications = (item) => {
    return (
      (item.selectedVariation) ||
      (item.selectedExtras && item.selectedExtras.length > 0) ||
      (item.selectedSideOrders && item.selectedSideOrders.length > 0) ||
      // Legacy formats
      (item.modifications && item.modifications.length > 0) ||
      (item.extras && item.extras.length > 0) ||
      (item.sideOrders && item.sideOrders.length > 0) ||
      (item.type) // Consider type as a simple variation
    );
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg relative max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white rounded-t-lg">
            <h3 className="text-lg font-bold">Order #{selectedOrder.orderNo || "N/A"}</h3>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {modalLoading ? (
              <OrderDetailsSkeleton />
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Full Name:</p>
                      <p className="font-medium">{selectedOrder.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mobile Number:</p>
                      <p className="font-medium">{selectedOrder.mobileNumber}</p>
                    </div>
                    {selectedOrder.alternateMobile && (
                      <div>
                        <p className="text-sm text-gray-600">Alternate Mobile:</p>
                        <p className="font-medium">{selectedOrder.alternateMobile}</p>
                      </div>
                    )}
                    {selectedOrder.email && (
                      <div>
                        <p className="text-sm text-gray-600">Email:</p>
                        <p className="font-medium">{selectedOrder.email}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Order Number:</p>
                      <p className="font-medium">king-{selectedOrder.orderNo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Type:</p>
                      <p className="font-medium capitalize">
                        {selectedOrder.orderType || "Delivery"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Status:</p>
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                        {selectedOrder.status || "Pending"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method:</p>
                      <p className="font-medium">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    </div>
                    {selectedOrder.paymentMethod === "online" && selectedOrder.bankName && (
                      <div>
                        <p className="text-sm text-gray-600">Payment Platform:</p>
                        <p className="font-medium">{selectedOrder.bankName}</p>
                      </div>
                    )}
                    {selectedOrder.createdAt && (
                      <div>
                        <p className="text-sm text-gray-600">Order Date:</p>
                        <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedOrder.status === "Dispatched" && selectedOrder.riderName && (
                      <div>
                        <p className="text-sm text-gray-600">Rider Name:</p>
                        <p className="font-medium">{selectedOrder.riderName}</p>
                      </div>
                    )}
                    {selectedOrder.status === "Cancel" && selectedOrder.cancelReason && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Cancel Reason:</p>
                        <p className="font-medium text-red-600">{selectedOrder.cancelReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedOrder.orderType === "delivery" && selectedOrder.deliveryAddress && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Information
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Delivery Address:</p>
                        <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                      </div>
                      
                      {area && (
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-600">Area:</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                              {area}
                            </span>
                            <span className="text-sm text-gray-600">
                              (Delivery Fee: Rs. {deliveryFee})
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {selectedOrder.nearestLandmark && (
                        <div>
                          <p className="text-sm text-gray-600">Nearest Landmark:</p>
                          <p className="font-medium">{selectedOrder.nearestLandmark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.orderType === "pickup" && selectedOrder.pickupTime && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pickup Information
                    </h4>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Time:</p>
                      <p className="font-medium">{selectedOrder.pickupTime}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.items && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order Items
                    </h4>
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOrder.items.map((item, i) => {
                            // Handle item parsing from the updated schema structure
                            const quantity = item.quantity || 1;
                            
                            // Get the title/name (prioritize title from new schema)
                            const itemName = item.title || item.name || "";
                            
                            // Calculate unit price and total
                            const unitPrice = item.price || 0;
                            const itemTotal = unitPrice * quantity;

                            return (
                              <React.Fragment key={i}>
                                <tr>
                                  <td className="px-3 py-2 text-sm text-gray-900">
                                    <div className="font-medium">{itemName}</div>
                                    {/* Simple variation (legacy format) */}
                                    {item.type && !item.selectedVariation && (
                                      <div className="text-xs text-gray-500">Type: {item.type}</div>
                                    )}
                                    {/* New schema variation */}
                                    {item.selectedVariation && (
                                      <div className="text-xs text-gray-500">
                                        Variation: {item.selectedVariation.name} 
                                        ({item.selectedVariation.price !== unitPrice ? 
                                          `+Rs. ${formatPrice(item.selectedVariation.price)}` : 'included'}
                                        )
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-gray-500 text-center">{quantity}</td>
                                  <td className="px-3 py-2 text-sm text-gray-500 text-right">Rs. {formatPrice(unitPrice)}</td>
                                  <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">Rs. {formatPrice(itemTotal)}</td>
                                </tr>
                                
                                {/* Render modifications based on the new schema */}
                                {hasModifications(item) && (
                                  <tr>
                                    <td colSpan="4" className="px-3 py-2">
                                      <div className="bg-gray-50 rounded p-2 text-xs">
                                        {/* Selected Extras (new schema) */}
                                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                                          <div className="mb-2">
                                            <div className="font-medium text-gray-700">Extras:</div>
                                            <div className="ml-2 space-y-1">
                                              {item.selectedExtras.map((extra, idx) => (
                                                <div key={`extra-${idx}`} className="flex justify-between">
                                                  <span>{extra.name}</span>
                                                  <span className="text-gray-600">+Rs. {formatPrice(extra.price)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Selected Side Orders (new schema) */}
                                        {item.selectedSideOrders && item.selectedSideOrders.length > 0 && (
                                          <div className="mb-2">
                                            <div className="font-medium text-gray-700">Side Orders:</div>
                                            <div className="ml-2 space-y-1">
                                              {item.selectedSideOrders.map((sideOrder, idx) => (
                                                <div key={`side-${idx}`} className="flex justify-between">
                                                  <span>{sideOrder.name}</span>
                                                  <span className="text-gray-600">+Rs. {formatPrice(sideOrder.price)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Handle legacy modifications format if present */}
                                        {item.modifications && item.modifications.length > 0 && (
                                          item.modifications.map((mod, index) => (
                                            <div key={`mod-${index}`} className="mb-2">
                                              <div className="font-medium text-gray-700">{mod.type}:</div>
                                              <div className="ml-2 space-y-1">
                                                {mod.items.map((modItem, idx) => (
                                                  <div key={`mod-${index}-${idx}`} className="flex justify-between">
                                                    <span>{modItem.name}</span>
                                                    <span className="text-gray-600">+Rs. {formatPrice(modItem.price)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ))
                                        )}
                                        
                                        {/* Handle legacy extras format if present */}
                                        {!item.modifications && !item.selectedExtras && item.extras && item.extras.length > 0 && (
                                          <div className="mb-2">
                                            <div className="font-medium text-gray-700">Extras:</div>
                                            <div className="ml-2 space-y-1">
                                              {item.extras.map((extra, idx) => (
                                                <div key={`legacy-extra-${idx}`} className="flex justify-between">
                                                  <span>{extra.name}</span>
                                                  <span className="text-gray-600">+Rs. {formatPrice(extra.price)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Handle legacy side orders format if present */}
                                        {!item.modifications && !item.selectedSideOrders && item.sideOrders && item.sideOrders.length > 0 && (
                                          <div className="mb-2">
                                            <div className="font-medium text-gray-700">Side Orders:</div>
                                            <div className="ml-2 space-y-1">
                                              {item.sideOrders.map((sideOrder, idx) => (
                                                <div key={`legacy-side-${idx}`} className="flex justify-between">
                                                  <span>{sideOrder.name}</span>
                                                  <span className="text-gray-600">+Rs. {formatPrice(sideOrder.price)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Display special instructions if any */}
                                        {item.specialInstructions && (
                                          <div className="mt-2 pt-2 border-t border-gray-200">
                                            <div className="font-medium text-gray-700">Special Instructions:</div>
                                            <div className="ml-2 text-gray-600 italic">{item.specialInstructions}</div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Payment Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">Rs. {formatPrice(extractValue(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">Rs. {formatPrice(extractValue(selectedOrder.tax))}</span>
                    </div>
                    {selectedOrder.orderType === "delivery" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee ({area}):</span>
                        <span className="font-medium">
                          Rs. {formatPrice(selectedOrder.deliveryFee || deliveryFee)}
                        </span>
                      </div>
                    )}
                    
                    {/* Display discount breakdowns if available */}
                    {selectedOrder.globalDiscount > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span>Global Discount ({selectedOrder.globalDiscountPercentage || 0}%):</span>
                        <span>- Rs. {formatPrice(selectedOrder.globalDiscount)}</span>
                      </div>
                    )}
                    
                    {selectedOrder.promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo Discount ({selectedOrder.promoCode || ''} - {selectedOrder.promoDiscountPercentage || 0}%):</span>
                        <span>- Rs. {formatPrice(selectedOrder.promoDiscount)}</span>
                      </div>
                    )}
                    
                    {/* Show total discount (for backwards compatibility) */}
                    {(!selectedOrder.globalDiscount && !selectedOrder.promoDiscount && selectedOrder.discount > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-yellow-600">- Rs. {formatPrice(extractValue(selectedOrder.discount))}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-red-600">Rs. {formatPrice(extractValue(selectedOrder.total))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedOrder.paymentInstructions && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Payment Instructions:</p>
                      <p className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100">
                        {selectedOrder.paymentInstructions}
                      </p>
                    </div>
                  )}
                  {selectedOrder.changeRequest && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Change Request:</p>
                      <p className="text-sm">Rs. {selectedOrder.changeRequest}</p>
                    </div>
                  )}
                  {selectedOrder.isGift && selectedOrder.giftMessage && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Gift Message:</p>
                      <p className="text-sm bg-pink-50 p-2 rounded border border-pink-100">
                        {selectedOrder.giftMessage}
                      </p>
                    </div>
                  )}

                  {selectedOrder.paymentMethod === "online" && selectedOrder.receiptImageUrl && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Payment Receipt:</p>
                      <div className="mt-1">
                        <img
                          src={selectedOrder.receiptImageUrl}
                          alt="Payment Receipt"
                          className="max-w-full h-auto max-h-60 border rounded cursor-pointer hover:opacity-90"
                          onClick={() => openReceiptModal(selectedOrder.receiptImageUrl)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Status Update Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Update Order Status
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Status:</label>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In-Process">In-Process</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Complete">Complete</option>
                        <option value="Cancel">Cancel</option>
                      </select>
                    </div>
                    
                    {status === "Dispatched" && (
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Rider Name: <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={riderName} 
                          onChange={(e) => setRiderName(e.target.value)}
                          placeholder="Enter rider name"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          required
                        />
                      </div>
                    )}
                    
                    {status === "Cancel" && (
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">Cancel Reason: <span className="text-red-500">*</span></label>
                        <textarea 
                          value={cancelReason} 
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Enter reason for cancellation"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          rows="2"
                          required
                        ></textarea>
                      </div>
                    )}
                    
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdating}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Status
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-gray-700">Print Options:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => printKitchenSlip(selectedOrder)}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Kitchen Slip
                </button>
                <button
                  onClick={() => printDeliveryPreBill(selectedOrder)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Pre-Bill
                </button>
                <button
                  onClick={() => printDeliveryPaymentReceipt(selectedOrder)}
                  className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Payment Receipt
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700">Order Actions:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => deleteOrder(String(extractValue(selectedOrder._id)))}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {receiptModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl w-full mx-4">
            <button
              onClick={closeReceiptModal}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:text-gray-600 focus:outline-none"
              aria-label="Close receipt view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={receiptModal.imageUrl}
              alt="Payment Receipt"
              className="max-w-full max-h-[85vh] mx-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}