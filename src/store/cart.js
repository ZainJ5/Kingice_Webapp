import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addToCart: (deal) =>
    set((state) => {
      // Look for an existing item with the same ID and type (if applicable)
      const index = state.items.findIndex(
        (item) => item._id === deal._id && 
                  (!deal.type || item.type === deal.type)
      );
      
      if (index === -1) {
        // Item not found, add as new
        return {
          items: [
            ...state.items,
            { ...deal, quantity: 1, title: `${deal.title} x1` }
          ],
          total: state.total + Number(deal.price),
          itemCount: state.itemCount + 1,
        };
      }
      
      // Item found, update quantity
      const newItems = [...state.items];
      const currentQuantity = newItems[index].quantity || 1;
      const newQuantity = currentQuantity + 1;
      const baseTitle = newItems[index].title.split(" x")[0];
      newItems[index] = {
        ...newItems[index],
        quantity: newQuantity,
        title: `${baseTitle} x${newQuantity}`,
      };
      
      return {
        items: newItems,
        total: state.total + Number(deal.price),
        itemCount: state.itemCount + 1,
      };
    }),

  updateItemQuantity: (index, newQuantity) => {
    if (newQuantity < 1) {
      return get().removeFromCart(index);
    }
    set((state) => {
      const newItems = [...state.items];
      const oldQuantity = newItems[index].quantity || 1;
      const priceDifference = (newQuantity - oldQuantity) * Number(newItems[index].price);
      const baseTitle = newItems[index].title.split(" x")[0];
      newItems[index] = {
        ...newItems[index],
        quantity: newQuantity,
        title: `${baseTitle} x${newQuantity}`,
      };
      
      return {
        items: newItems,
        total: state.total + priceDifference,
        itemCount: state.itemCount + (newQuantity - oldQuantity),
      };
    });
  },

  removeFromCart: (index) =>
    set((state) => {
      const newItems = [...state.items];
      const removedItem = newItems.splice(index, 1)[0];
      return {
        items: newItems,
        total: state.total - Number(removedItem.price) * (removedItem.quantity || 1),
        itemCount: state.itemCount - (removedItem.quantity || 1),
      };
    }),

  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));