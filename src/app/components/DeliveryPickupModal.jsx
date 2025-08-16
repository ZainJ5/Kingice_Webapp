"use client";
import { useEffect, useState } from "react";
import { useOrderTypeStore } from "../../store/orderTypeStore";
import { useBranchStore } from "../../store/branchStore";
import { Truck, ShoppingBag } from "lucide-react";

export default function DeliveryPickupModal() {
  const [isSiteActive, setIsSiteActive] = useState(true);
  const [settings, setSettings] = useState({
    allowDelivery: true,
    allowPickup: true,
    defaultOption: 'none',
    deliveryMessage: 'Get your food delivered to your doorstep',
    pickupMessage: 'Pick up your order at our restaurant',
    defaultBranchId: null
  });

  const { orderType, setOrderType } = useOrderTypeStore();
  const { branch, setBranch } = useBranchStore();

  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState("/logo.png"); 

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const statusRes = await fetch("/api/site-status");
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setIsSiteActive(statusData.isSiteActive);
        }
        
        const settingsRes = await fetch("/api/delivery-pickup");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
        
        const branchesRes = await fetch("/api/branches");
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData);
        }

        const logoRes = await fetch("/api/logo");
        if (logoRes.ok) {
          const logoData = await logoRes.json();
          setLogoUrl(logoData.logo);
        }
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
    if (!branch && branches.length > 0) {
      if (settings.defaultBranchId) {
        const defaultBranch = branches.find(b => getBranchId(b) === settings.defaultBranchId);
        if (defaultBranch) {
          setBranch(defaultBranch);
        } else {
          setBranch(branches[0]);
        }
      } else {
        setBranch(branches[0]);
      }
    }
  }, [branch, branches, settings, setBranch]);

  useEffect(() => {
    if (!orderType && settings.defaultOption !== 'none') {
      if ((settings.defaultOption === 'delivery' && settings.allowDelivery) || 
          (settings.defaultOption === 'pickup' && settings.allowPickup)) {
        setOrderType(settings.defaultOption);
      }
    }
  }, [orderType, settings, setOrderType]);

  useEffect(() => {
    if (branch && orderType) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [branch, orderType]);

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
    setOrderType(type);
  };

  const handleBranchSelect = (selectedBranch) => {
    setBranch(selectedBranch);
  };

  const getBranchId = (b) => {
    return b._id?.$oid || b._id;
  };

  if (!isSiteActive) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-6 px-8">
            <h2 className="text-3xl font-bold tracking-tight">Service Currently Unavailable</h2>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fadeIn p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading options...</p>
        </div>
      </div>
    );
  }

  if (!open) return null;

  if (!settings.allowDelivery && !settings.allowPickup) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-6 px-8">
            <h2 className="text-3xl font-bold tracking-tight">Service Unavailable</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-700 text-center font-medium">Our ordering system is currently unavailable. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="relative">
          <div className="bg-gradient-to-r from-red-600 to-red-700 h-16"></div>
          
          <div className="absolute left-0 right-0 top-5 flex justify-center">
            <div className="rounded-full bg-white p-1 border-2 border-red-100">
              <img 
                src={logoUrl} 
                alt="Restaurant Logo" 
                className="h-28 w-28 object-contain rounded-full"
              />
            </div>
          </div>
          
          <div className="h-16"></div>
        </div>

        <div className="p-8 pt-4 space-y-2">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Select Branch</h3>
          <div className="grid grid-cols-2 mb-2 gap-2">
            {branches.map((b) => {
              const branchId = getBranchId(b);
              const isSelected = branch && getBranchId(branch) === branchId;
              return (
                <button
                  key={branchId}
                  onClick={() => handleBranchSelect(b)}
                  className={`w-full p-4 text-md rounded-lg 
                    transition-all duration-200 ease-in-out ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600 shadow-md"
                        : "bg-white text-gray-700  border-gray-200 hover:bg-red-50 hover:border-red-500 hover:shadow-sm"
                    }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        
          {(settings.allowDelivery || settings.allowPickup) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Order Type</h3>
              <div className={`grid ${settings.allowDelivery && settings.allowPickup ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                {settings.allowDelivery && (
                  <button
                    onClick={() => handleOrderTypeSelect("delivery")}
                    className={`flex flex-col items-center p-6 border rounded-lg 
                      transition-all duration-200 ease-in-out ${
                        orderType === "delivery"
                          ? "bg-red-600 text-white border-red-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-500 hover:shadow-sm"
                      }`}
                  >
                    <Truck
                      size={32}
                      className={`mb-3 ${
                        orderType === "delivery" ? "text-white" : "text-red-600"
                      }`}
                    />
                    <span className="font-semibold text-base">Delivery</span>
                    <span className="text-xs mt-2 text-center opacity-80">
                      {settings.deliveryMessage}
                    </span>
                  </button>
                )}
                
                {settings.allowPickup && (
                  <button
                    onClick={() => handleOrderTypeSelect("pickup")}
                    className={`flex flex-col items-center p-6 border rounded-lg 
                      transition-all duration-200 ease-in-out ${
                        orderType === "pickup"
                          ? "bg-red-600 text-white border-red-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:border-red-500 hover:shadow-sm"
                      }`}
                  >
                    <ShoppingBag
                      size={32}
                      className={`mb-3 ${
                        orderType === "pickup" ? "text-white" : "text-red-600"
                      }`}
                    />
                    <span className="font-semibold text-base">Pickup</span>
                    <span className="text-xs mt-2 text-center opacity-80">
                      {settings.pickupMessage}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}