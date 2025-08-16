"use client";
import { create } from "zustand";

export const useDeliveryAreaStore = create((set) => ({
  deliveryArea: null,
  setDeliveryArea: (area) => set({ deliveryArea: area }),
}));