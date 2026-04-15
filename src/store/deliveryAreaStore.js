"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDeliveryAreaStore = create((set) => ({
  deliveryArea: null,
  setDeliveryArea: (deliveryArea) => set({ deliveryArea }),
  clearDeliveryArea: () => set({ deliveryArea: null }),
}));
