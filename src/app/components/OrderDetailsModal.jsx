import React, { useState, useEffect } from "react";
import { Eye, Printer, CheckCircle, XCircle, Trash2, Save, MessageCircle } from "lucide-react";

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

export default function OrderDetails({
  selectedOrder,
  modalLoading,
  closeDetails,
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
  const [area, setArea] = useState("");

  useEffect(() => {
    if (selectedOrder) {
      const extractedArea = selectedOrder.area || 
        (selectedOrder.deliveryAddress ? extractAreaFromAddress(selectedOrder.deliveryAddress) : null);
      
      setArea(extractedArea || "");
    }
  }, [selectedOrder, extractAreaFromAddress]);

  if (!selectedOrder) return null;

  // Function to format phone number for WhatsApp API
  const formatPhoneForWhatsApp = (phoneNumber) => {
    // Remove spaces, dashes, parentheses and other non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Add Pakistan country code if not present
    // Assuming Pakistani numbers - if this isn't the case, you might need additional logic
    if (cleanNumber.startsWith('0')) {
      return `92${cleanNumber.substring(1)}`;
    }
    
    return cleanNumber;
  };

  // Function to open WhatsApp chat
  const openWhatsAppChat = (phoneNumber) => {
    const formattedNumber = formatPhoneForWhatsApp(phoneNumber);
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
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
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Order #{selectedOrder.orderNo || "N/A"}</h3>
          <button
            onClick={closeDetails}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {modalLoading ? (
            <OrderDetailsSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Row 1: Customer and Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                    Customer Information
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedOrder.fullName}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
                      <dd className="mt-1 text-sm text-gray-900 flex items-center">
                        {selectedOrder.mobileNumber}
                        <button 
                          onClick={() => openWhatsAppChat(selectedOrder.mobileNumber)}
                          className="ml-2 text-green-600 hover:text-green-700"
                          aria-label="WhatsApp this number"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </button>
                      </dd>
                    </div>
                    {selectedOrder.alternateMobile && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Alternate Mobile</dt>
                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                          {selectedOrder.alternateMobile}
                          <button 
                            onClick={() => openWhatsAppChat(selectedOrder.alternateMobile)}
                            className="ml-2 text-green-600 hover:text-green-700"
                            aria-label="WhatsApp this alternate number"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </dd>
                      </div>
                    )}
                    {selectedOrder.email && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.email}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Order Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-indigo-600" />
                    Order Details
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">king-{selectedOrder.orderNo}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Order Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{selectedOrder.orderType || "Delivery"}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedOrder.status)}`}>
                          {selectedOrder.status || "Pending"}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</dd>
                    </div>
                    {selectedOrder.paymentMethod === "online" && selectedOrder.bankName && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Payment Platform</dt>
                        <dd className="mt-1 text-sm text-gray-900">{selectedOrder.bankName}</dd>
                      </div>
                    )}
                    {selectedOrder.createdAt && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Order Date</dt>
                        <dd className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Row 2: Delivery/Pickup and Payment Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery or Pickup Information */}
                {(selectedOrder.orderType === "delivery" && selectedOrder.deliveryAddress) || (selectedOrder.orderType === "pickup" && selectedOrder.pickupTime) ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-indigo-600" />
                      {selectedOrder.orderType === "delivery" ? "Delivery Information" : "Pickup Information"}
                    </h4>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                      {selectedOrder.orderType === "delivery" && (
                        <>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedOrder.deliveryAddress}</dd>
                          </div>
                          {area && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Area</dt>
                              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {area}
                                </span>
                                (Fee: Rs. {deliveryFee})
                              </dd>
                            </div>
                          )}
                          {selectedOrder.nearestLandmark && (
                            <div className="sm:col-span-1">
                              <dt className="text-sm font-medium text-gray-500">Nearest Landmark</dt>
                              <dd className="mt-1 text-sm text-gray-900">{selectedOrder.nearestLandmark}</dd>
                            </div>
                          )}
                        </>
                      )}
                      {selectedOrder.orderType === "pickup" && (
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Pickup Time</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedOrder.pickupTime}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ) : null}

                {/* Payment Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Save className="h-5 w-5 mr-2 text-indigo-600" />
                    Payment Summary
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                      <dd className="mt-1 text-sm text-gray-900">Rs. {formatPrice(extractValue(selectedOrder.subtotal))}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Tax</dt>
                      <dd className="mt-1 text-sm text-gray-900">Rs. {formatPrice(extractValue(selectedOrder.tax))}</dd>
                    </div>
                    {selectedOrder.orderType === "delivery" && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Delivery Fee</dt>
                        <dd className="mt-1 text-sm text-gray-900">Rs. {formatPrice(selectedOrder.deliveryFee || deliveryFee)}</dd>
                      </div>
                    )}
                    {selectedOrder.globalDiscount > 0 && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Global Discount ({selectedOrder.globalDiscountPercentage || 0}%)</dt>
                        <dd className="mt-1 text-sm text-amber-600">- Rs. {formatPrice(selectedOrder.globalDiscount)}</dd>
                      </div>
                    )}
                    {selectedOrder.promoDiscount > 0 && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Promo Discount ({selectedOrder.promoCode || ''} - {selectedOrder.promoDiscountPercentage || 0}%)</dt>
                        <dd className="mt-1 text-sm text-green-600">- Rs. {formatPrice(selectedOrder.promoDiscount)}</dd>
                      </div>
                    )}
                    {(!selectedOrder.globalDiscount && !selectedOrder.promoDiscount && selectedOrder.discount > 0) && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Discount</dt>
                        <dd className="mt-1 text-sm text-yellow-600">- Rs. {formatPrice(extractValue(selectedOrder.discount))}</dd>
                      </div>
                    )}
                    <div className="sm:col-span-2 border-t pt-2 mt-2">
                      <dt className="text-sm font-medium text-gray-500">Total</dt>
                      <dd className="mt-1 text-sm font-bold text-indigo-600">Rs. {formatPrice(extractValue(selectedOrder.total))}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && (
                <div className="bg-white border border-gray-200 rounded-lg p-5 overflow-x-auto">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Printer className="h-5 w-5 mr-2 text-indigo-600" />
                    Order Items
                  </h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, i) => {
                        const quantity = item.quantity || 1;
                        const itemName = item.title || item.name || "";
                        const unitPrice = item.price || 0;
                        const itemTotal = unitPrice * quantity;

                        return (
                          <React.Fragment key={i}>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="font-medium text-gray-900">{itemName}</div>
                                {item.type && !item.selectedVariation && (
                                  <div className="text-xs text-gray-500">Type: {item.type}</div>
                                )}
                                {item.selectedVariation && (
                                  <div className="text-xs text-gray-500">
                                    Variation: {item.selectedVariation.name} 
                                    ({item.selectedVariation.price !== unitPrice ? 
                                      `+Rs. ${formatPrice(item.selectedVariation.price)}` : 'included'})
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">Rs. {formatPrice(unitPrice)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Rs. {formatPrice(itemTotal)}</td>
                            </tr>
                            {hasModifications(item) && (
                              <tr>
                                <td colSpan="4" className="px-6 py-4 bg-gray-50">
                                  <div className="text-xs space-y-2">
                                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                                      <div>
                                        <div className="font-medium text-gray-700">Extras:</div>
                                        {item.selectedExtras.map((extra, idx) => (
                                          <div key={`extra-${idx}`} className="flex justify-between ml-2">
                                            <span>{extra.name}</span>
                                            <span className="text-gray-600">+Rs. {formatPrice(extra.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {item.selectedSideOrders && item.selectedSideOrders.length > 0 && (
                                      <div>
                                        <div className="font-medium text-gray-700">Side Orders:</div>
                                        {item.selectedSideOrders.map((sideOrder, idx) => (
                                          <div key={`side-${idx}`} className="flex justify-between ml-2">
                                            <span>{sideOrder.name}</span>
                                            <span className="text-gray-600">+Rs. {formatPrice(sideOrder.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {item.modifications && item.modifications.length > 0 && item.modifications.map((mod, index) => (
                                      <div key={`mod-${index}`}>
                                        <div className="font-medium text-gray-700">{mod.type}:</div>
                                        {mod.items.map((modItem, idx) => (
                                          <div key={`mod-${index}-${idx}`} className="flex justify-between ml-2">
                                            <span>{modItem.name}</span>
                                            <span className="text-gray-600">+Rs. {formatPrice(modItem.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                    {!item.modifications && !item.selectedExtras && item.extras && item.extras.length > 0 && (
                                      <div>
                                        <div className="font-medium text-gray-700">Extras:</div>
                                        {item.extras.map((extra, idx) => (
                                          <div key={`legacy-extra-${idx}`} className="flex justify-between ml-2">
                                            <span>{extra.name}</span>
                                            <span className="text-gray-600">+Rs. {formatPrice(extra.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {!item.modifications && !item.selectedSideOrders && item.sideOrders && item.sideOrders.length > 0 && (
                                      <div>
                                        <div className="font-medium text-gray-700">Side Orders:</div>
                                        {item.sideOrders.map((sideOrder, idx) => (
                                          <div key={`legacy-side-${idx}`} className="flex justify-between ml-2">
                                            <span>{sideOrder.name}</span>
                                            <span className="text-gray-600">+Rs. {formatPrice(sideOrder.price)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {item.specialInstructions && (
                                      <div className="mt-2">
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
              )}

              {/* Additional Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedOrder.paymentInstructions && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                      Order Instructions
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedOrder.paymentInstructions}
                    </p>
                  </div>
                )}
                {selectedOrder.changeRequest && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Save className="h-5 w-5 mr-2 text-indigo-600" />
                      Change Request
                    </h4>
                    <p className="text-sm text-gray-700">Rs. {selectedOrder.changeRequest}</p>
                  </div>
                )}
                {selectedOrder.isGift && selectedOrder.giftMessage && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                      Gift Message
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {selectedOrder.giftMessage}
                    </p>
                  </div>
                )}
                {selectedOrder.paymentMethod === "online" && selectedOrder.receiptImageUrl && (
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-indigo-600" />
                      Payment Receipt
                    </h4>
                    <img
                      src={selectedOrder.receiptImageUrl}
                      alt="Payment Receipt"
                      className="max-w-full h-auto rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openReceiptModal(selectedOrder.receiptImageUrl)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-0">Print Options</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => printKitchenSlip(selectedOrder)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Kitchen Slip
              </button>
              <button
                onClick={() => printDeliveryPreBill(selectedOrder)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Pre-Bill
              </button>
              <button
                onClick={() => printDeliveryPaymentReceipt(selectedOrder)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Payment Receipt
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 md:mb-0">Order Actions</h4>
            <button
              onClick={() => deleteOrder(String(extractValue(selectedOrder._id)))}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Order
            </button>
          </div>
        </div>
      </div>

      {receiptModal.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl w-full mx-4 bg-white rounded-lg shadow-xl p-4">
            <button
              onClick={closeReceiptModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close receipt view"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <img
              src={receiptModal.imageUrl}
              alt="Payment Receipt"
              className="max-w-full max-h-[80vh] mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}