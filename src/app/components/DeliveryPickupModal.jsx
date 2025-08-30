"use client";
import { useEffect, useState } from "react";
import { useOrderTypeStore } from "../../store/orderTypeStore";
import { useDeliveryAreaStore } from "../../store/deliveryAreaStore";
import { Truck, ShoppingBag } from "lucide-react";

export default function DeliveryPickupModal() {
  const [isSiteActive, setIsSiteActive] = useState(true);
  const [settings, setSettings] = useState({
    allowDelivery: true,
    allowPickup: true,
    defaultOption: 'none',
  });

  const { orderType, setOrderType } = useOrderTypeStore();
  const { deliveryArea, setDeliveryArea } = useDeliveryAreaStore();

  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); 

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [statusRes, settingsRes, logoRes, deliveryAreasRes] = await Promise.all([
          fetch("/api/site-status"),
          fetch("/api/delivery-pickup"),
          fetch("/api/logo"),
          fetch("/api/delivery-areas")
        ]);

        if (statusRes.ok) setIsSiteActive((await statusRes.json()).isSiteActive);
        if (settingsRes.ok) setSettings(await settingsRes.json());
        if (logoRes.ok) setLogoUrl((await logoRes.json()).logo);
        if (deliveryAreasRes.ok) setDeliveryAreas(await deliveryAreasRes.json());

      } catch (error) {
        console.error("Error fetching data:", error);
        setIsSiteActive(false); 
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!orderType && settings.defaultOption !== 'none') {
      if ((settings.defaultOption === 'delivery' && settings.allowDelivery) || 
          (settings.defaultOption === 'pickup' && settings.allowPickup)) {
        setOrderType(settings.defaultOption);
      }
    }
  }, [orderType, settings, setOrderType]);

  useEffect(() => {
    const isReadyToClose = orderType && 
                           (orderType === 'pickup' || (orderType === 'delivery' && deliveryArea));
    setOpen(!isReadyToClose);
  }, [orderType, deliveryArea]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOrderTypeSelect = (type) => {
    if (orderType === type) return;
    setOrderType(type);
    setDeliveryArea(null); 
  };
  
  const handleDeliveryAreaSelect = (e) => {
    const selectedAreaId = e.target.value;
    const area = deliveryAreas.find(a => getBranchId(a) === selectedAreaId);
    setDeliveryArea(area || null);
  };

  const getBranchId = (b) => {
    return b?._id?.$oid || b?._id;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white w-full max-w-sm rounded-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="relative">
          <div className="bg-red-600 h-16"></div>
          <div className="absolute left-1/2 -translate-x-1/2 top-4 flex justify-center">
            <div className="rounded-full bg-white p-1 border-2 border-gray-200 shadow-md">
              <img 
                src={logoUrl} 
                alt="Restaurant Logo" 
                className="h-24 w-24 object-contain rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="p-6 pt-16 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Select Order Type</h3>
            <div className={`grid ${settings.allowDelivery && settings.allowPickup ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {settings.allowDelivery && (
                <button
                  onClick={() => handleOrderTypeSelect("delivery")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ease-in-out h-24 ${
                    orderType === "delivery"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white hover:border-red-400"
                  }`}
                >
                  <Truck size={28} className="text-red-600 mb-2" />
                  <span className="font-semibold text-sm text-gray-800">Delivery</span>
                </button>
              )}
              {settings.allowPickup && (
                <button
                  onClick={() => handleOrderTypeSelect("pickup")}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ease-in-out h-24 ${
                    orderType === "pickup"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white hover:border-red-400"
                  }`}
                >
                  <ShoppingBag size={28} className="text-red-600 mb-2" />
                  <span className="font-semibold text-sm text-gray-800">Pickup</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <select
              value={getBranchId(deliveryArea) || ""}
              onChange={handleDeliveryAreaSelect}
              disabled={orderType !== 'delivery'}
              className={`w-full p-3 border rounded-lg bg-white transition-all duration-200 text-black ${
                orderType !== 'delivery' 
                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed' 
                  : 'border-gray-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
              }`}
            >
              <option value="" disabled className="text-gray-500">
                {orderType === 'delivery' ? 'Please select your location' : 'Not applicable for pickup'}
              </option>
              {deliveryAreas.length > 0 ? (
                deliveryAreas.map((area) => (
                  <option 
                    key={getBranchId(area)} 
                    value={getBranchId(area)} 
                    disabled={!area.isActive}
                    className={!area.isActive ? "text-gray-400" : "text-black"}
                  >
                    {area.name} {!area.isActive && "(Unavailable)"}
                  </option>
                ))
              ) : (
                <option disabled className="text-gray-500">No delivery areas found</option>
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}