import React, { useState, useEffect } from "react";
import { Eye, Printer, CheckCircle, XCircle, Trash2, Save, MessageCircle, Copy, Check } from "lucide-react";

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
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (selectedOrder) {
      const extractedArea = selectedOrder.area || 
        (selectedOrder.deliveryAddress ? extractAreaFromAddress(selectedOrder.deliveryAddress) : null);
      
      setArea(extractedArea || "");
    }
  }, [selectedOrder, extractAreaFromAddress]);

  if (!selectedOrder) return null;

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatPhoneForWhatsApp = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      return `92${cleanNumber.substring(1)}`;
    }
    
    return cleanNumber;
  };

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

  const deliveryFee = selectedOrder.orderType === 'delivery' && area ? 
    getDeliveryFeeForArea(area) : 0;

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0";
    return Number(price).toLocaleString();
  };

  const hasModifications = (item) => {
    return (
      (item.selectedVariation) ||
      (item.selectedExtras && item.selectedExtras.length > 0) ||
      (item.selectedSideOrders && item.selectedSideOrders.length > 0) ||
      (item.modifications && item.modifications.length > 0) ||
      (item.extras && item.extras.length > 0) ||
      (item.sideOrders && item.sideOrders.length > 0) ||
      (item.type) 
    );
  };

  const CopyButton = ({ text, fieldName }) => (
    <button
      onClick={() => copyToClipboard(text, fieldName)}
      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
      title={`Copy ${fieldName}`}
    >
      {copiedField === fieldName ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg relative max-w-lg md:max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white rounded-t-lg">
            <h3 className="text-lg font-bold">Order #{selectedOrder.orderNo || "N/A"}</h3>
            <button
              onClick={closeDetails}
              className="text-white hover:text-gray-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {modalLoading ? (
              <OrderDetailsSkeleton />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-semibold text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Full Name:</p>
                      <p className="font-bold text-gray-900">{selectedOrder.fullName}</p>
                      <CopyButton text={selectedOrder.fullName} fieldName="fullName" />
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Mobile Number:</p>
                      <div className="flex items-center">
                        <p className="font-bold text-gray-900">{selectedOrder.mobileNumber}</p>
                        <CopyButton text={selectedOrder.mobileNumber} fieldName="mobileNumber" />
                        <button 
                          onClick={() => openWhatsAppChat(selectedOrder.mobileNumber)}
                          className="ml-2 text-green-600 hover:text-green-700"
                          aria-label="WhatsApp this number"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {selectedOrder.alternateMobile && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Whatsapp:</p>
                        <div className="flex items-center">
                          <p className="font-bold text-gray-900">{selectedOrder.alternateMobile}</p>
                          <CopyButton text={selectedOrder.alternateMobile} fieldName="alternateMobile" />
                          <button 
                            onClick={() => openWhatsAppChat(selectedOrder.alternateMobile)}
                            className="ml-2 text-green-600 hover:text-green-700"
                            aria-label="WhatsApp this alternate number"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.email && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Email:</p>
                        <p className="font-bold text-gray-900">{selectedOrder.email}</p>
                        <CopyButton text={selectedOrder.email} fieldName="email" />
                      </div>
                    )}
                    {selectedOrder.orderType === "delivery" && selectedOrder.deliveryAddress && (
                      <>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Delivery Address:</p>
                          <p className="font-bold text-gray-900">{selectedOrder.deliveryAddress}</p>
                          <CopyButton text={selectedOrder.deliveryAddress} fieldName="deliveryAddress" />
                        </div>
                        {area && (
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Area:</p>
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-bold">
                                {area}
                              </span>
                              <CopyButton text={area} fieldName="area" />
                              <span className="text-sm text-gray-700 font-semibold">
                                (Delivery Fee: Rs. {deliveryFee})
                              </span>
                            </div>
                          </div>
                        )}
                        {selectedOrder.nearestLandmark && (
                          <div className="flex flex-wrap items-baseline gap-2">
                            <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Nearest Landmark:</p>
                            <p className="font-bold text-gray-900">{selectedOrder.nearestLandmark}</p>
                            <CopyButton text={selectedOrder.nearestLandmark} fieldName="nearestLandmark" />
                          </div>
                        )}
                      </>
                    )}
                    {selectedOrder.orderType === "pickup" && selectedOrder.pickupTime && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Pickup Time:</p>
                        <p className="font-bold text-gray-900">{selectedOrder.pickupTime}</p>
                        <CopyButton text={selectedOrder.pickupTime} fieldName="pickupTime" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 md:col-span-2">
                  <h4 className="text-md font-semibold mb-2 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Order Number:</p>
                      <p className="font-bold text-gray-900">{selectedOrder.orderNo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Order Type:</p>
                      <p className="font-bold text-gray-900 capitalize">
                        {selectedOrder.orderType || "Delivery"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Order Status:</p>
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                        {selectedOrder.status || "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Payment Method:</p>
                      <p className="font-bold text-gray-900">{selectedOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                    </div>
                    {selectedOrder.paymentMethod === "online" && selectedOrder.bankName && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Payment Platform:</p>
                        <p className="font-bold text-gray-900">{selectedOrder.bankName}</p>
                      </div>
                    )}
                    {selectedOrder.createdAt && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">Order Date:</p>
                        <p className="font-bold text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.items && (
                    <div className="mt-4">
                      <div className="mt-1 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Item</th>
                              <th className="px-3 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                              <th className="px-3 py-1 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                              <th className="px-3 py-1 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
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
                                    <td className="px-3 py-1 text-sm text-gray-900">
                                      <div className="font-bold">{itemName}</div>
                                      {item.type && !item.selectedVariation && (
                                        <div className="text-xs text-gray-700 font-semibold">Type: {item.type}</div>
                                      )}
                                      {item.selectedVariation && (
                                        <div className="text-xs text-gray-700 font-semibold">
                                          Variation: {item.selectedVariation.name} 
                                          ({item.selectedVariation.price !== unitPrice ? 
                                            `+Rs. ${formatPrice(item.selectedVariation.price)}` : 'included'}
                                          )
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-1 text-sm text-gray-900 font-bold text-center">{quantity}</td>
                                    <td className="px-3 py-1 text-sm text-gray-900 font-bold text-right">Rs. {formatPrice(unitPrice)}</td>
                                    <td className="px-3 py-1 text-sm font-bold text-gray-900 text-right">Rs. {formatPrice(itemTotal)}</td>
                                  </tr>
                                  
                                  {hasModifications(item) && (
                                    <tr>
                                      <td colSpan="4" className="px-3 py-1">
                                        <div className="bg-gray-50 rounded p-1 text-xs">
                                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                                            <div className="mb-1">
                                              <div className="font-bold text-gray-800">Extras:</div>
                                              <div className="ml-2 space-y-0.5">
                                                {item.selectedExtras.map((extra, idx) => (
                                                  <div key={`extra-${idx}`} className="flex justify-between">
                                                    <span className="font-semibold text-gray-800">{extra.name}</span>
                                                    <span className="text-gray-700 font-semibold">+Rs. {formatPrice(extra.price)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.selectedSideOrders && item.selectedSideOrders.length > 0 && (
                                            <div className="mb-1">
                                              <div className="font-bold text-gray-800">Side Orders:</div>
                                              <div className="ml-2 space-y-0.5">
                                                {item.selectedSideOrders.map((sideOrder, idx) => (
                                                  <div key={`side-${idx}`} className="flex justify-between">
                                                    <span className="font-semibold text-gray-800">{sideOrder.name}</span>
                                                    <span className="text-gray-700 font-semibold">+Rs. {formatPrice(sideOrder.price)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.modifications && item.modifications.length > 0 && (
                                            item.modifications.map((mod, index) => (
                                              <div key={`mod-${index}`} className="mb-1">
                                                <div className="font-bold text-gray-800">{mod.type}:</div>
                                                <div className="ml-2 space-y-0.5">
                                                  {mod.items.map((modItem, idx) => (
                                                    <div key={`mod-${index}-${idx}`} className="flex justify-between">
                                                      <span className="font-semibold text-gray-800">{modItem.name}</span>
                                                      <span className="text-gray-700 font-semibold">+Rs. {formatPrice(modItem.price)}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))
                                          )}
                                          
                                          {!item.modifications && !item.selectedExtras && item.extras && item.extras.length > 0 && (
                                            <div className="mb-1">
                                              <div className="font-bold text-gray-800">Extras:</div>
                                              <div className="ml-2 space-y-0.5">
                                                {item.extras.map((extra, idx) => (
                                                  <div key={`legacy-extra-${idx}`} className="flex justify-between">
                                                    <span className="font-semibold text-gray-800">{extra.name}</span>
                                                    <span className="text-gray-700 font-semibold">+Rs. {formatPrice(extra.price)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {!item.modifications && !item.selectedSideOrders && item.sideOrders && item.sideOrders.length > 0 && (
                                            <div className="mb-1">
                                              <div className="font-bold text-gray-800">Side Orders:</div>
                                              <div className="ml-2 space-y-0.5">
                                                {item.sideOrders.map((sideOrder, idx) => (
                                                  <div key={`legacy-side-${idx}`} className="flex justify-between">
                                                    <span className="font-semibold text-gray-800">{sideOrder.name}</span>
                                                    <span className="text-gray-700 font-semibold">+Rs. {formatPrice(sideOrder.price)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {item.specialInstructions && (
                                            <div className="mt-1 pt-1 border-t border-gray-200">
                                              <div className="font-bold text-gray-800">Special Instructions:</div>
                                              <div className="ml-2 text-gray-700 font-semibold italic">{item.specialInstructions}</div>
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
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 md:col-span-2">
                  <h4 className="text-md font-semibold mb-2 text-gray-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Payment Summary
                  </h4>
                  <div className="space-y-0.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Subtotal:</span>
                      <span className="font-bold text-gray-900">Rs. {formatPrice(extractValue(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-semibold">Tax:</span>
                      <span className="font-bold text-gray-900">Rs. {formatPrice(extractValue(selectedOrder.tax))}</span>
                    </div>
                    {selectedOrder.orderType === "delivery" && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-semibold">Delivery Fee ({area}):</span>
                        <span className="font-bold text-gray-900">
                          Rs. {formatPrice(selectedOrder.deliveryFee || deliveryFee)}
                        </span>
                      </div>
                    )}
                    
                    {selectedOrder.globalDiscount > 0 && (
                      <div className="flex justify-between text-amber-600">
                        <span className="font-semibold">Global Discount ({selectedOrder.globalDiscountPercentage || 0}%):</span>
                        <span className="font-bold">- Rs. {formatPrice(selectedOrder.globalDiscount)}</span>
                      </div>
                    )}
                    
                    {selectedOrder.promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="font-semibold">Promo Discount ({selectedOrder.promoCode || ''} - {selectedOrder.promoDiscountPercentage || 0}%):</span>
                        <span className="font-bold">- Rs. {formatPrice(selectedOrder.promoDiscount)}</span>
                      </div>
                    )}
                    
                    {(!selectedOrder.globalDiscount && !selectedOrder.promoDiscount && selectedOrder.discount > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-semibold">Discount:</span>
                        <span className="font-bold text-yellow-600">- Rs. {formatPrice(extractValue(selectedOrder.discount))}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-red-600 text-base">Rs. {formatPrice(extractValue(selectedOrder.total))}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  {selectedOrder.paymentInstructions && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">Order Instructions:</p>
                      <p className="text-sm font-semibold text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-100">
                        {selectedOrder.paymentInstructions}
                      </p>
                      <CopyButton text={selectedOrder.paymentInstructions} fieldName="paymentInstructions" />
                    </div>
                  )}
                  {selectedOrder.changeRequest && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">Change Request:</p>
                      <p className="text-sm font-bold text-gray-900">Rs. {selectedOrder.changeRequest}</p>
                      <CopyButton text={`Rs. ${selectedOrder.changeRequest}`} fieldName="changeRequest" />
                    </div>
                  )}
                  {selectedOrder.isGift && selectedOrder.giftMessage && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm text-gray-700 font-bold whitespace-nowrap">Gift Message:</p>
                      <p className="text-sm font-semibold text-gray-800 bg-pink-50 p-2 rounded border border-pink-100">
                        {selectedOrder.giftMessage}
                      </p>
                      <CopyButton text={selectedOrder.giftMessage} fieldName="giftMessage" />
                    </div>
                  )}

                  {selectedOrder.paymentMethod === "online" && selectedOrder.receiptImageUrl && (
                    <div>
                      <p className="text-sm text-gray-700 font-bold mb-1">Payment Receipt:</p>
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
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="">
              <h4 className="text-sm font-bold mb-1 text-gray-800">Print Options:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => printKitchenSlip(selectedOrder)}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Kitchen Slip
                </button>
                <button
                  onClick={() => printDeliveryPreBill(selectedOrder)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Pre-Bill
                </button>
                <button
                  onClick={() => printDeliveryPaymentReceipt(selectedOrder)}
                  className="px-3 py-2 bg-purple-600 text-white text-sm font-semibold rounded hover:bg-purple-700 transition flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Payment Receipt
                </button>
              </div>
            </div>

            {/* <div>
              <h4 className="text-sm font-medium mb-1 text-gray-700">Order Actions:</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => deleteOrder(String(extractValue(selectedOrder._id)))}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Order
                </button>
              </div>
            </div> */}
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