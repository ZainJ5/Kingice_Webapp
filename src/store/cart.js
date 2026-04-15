import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addToCart: (item) =>
    set((state) => {
      // Calculate the actual price to use (may include extras/side orders)
      const itemPrice = item.totalPrice || Number(item.price);
      
      // Create a unique identifier that includes variations, extras, and side orders
      const getItemSignature = (cartItem) => {
        const baseSignature = `${cartItem._id}${cartItem.type || ''}`;
        
        // Add extras to signature if they exist
        const extrasSignature = cartItem.selectedExtras 
          ? cartItem.selectedExtras.map(e => e.name).sort().join(',')
          : '';
          
        // Add side orders to signature if they exist  
        const sideOrdersSignature = cartItem.selectedSideOrders
          ? cartItem.selectedSideOrders.map(s => s.name).sort().join(',')
          : '';
          
        return `${baseSignature}-${extrasSignature}-${sideOrdersSignature}`;
      };
      
      const newItemSignature = getItemSignature(item);
      
      // Look for an existing item with the same signature
      const index = state.items.findIndex(existingItem => 
        getItemSignature(existingItem) === newItemSignature
      );
      
      // Create formatted title with modifications
      const getFormattedTitle = (baseTitle, type, extras, sideOrders, quantity = 1) => {
        let title = baseTitle;
        
        // Add variation type if exists
        if (type) {
          title = `${title} (${type})`;
        }
        
        // Add quantity
        title = `${title} x${quantity}`;
        
        return title;
      };
      
      // Build modifications list for display
      const getModifications = (item) => {
        const mods = [];
        
        // Add selected extras
        if (item.selectedExtras && item.selectedExtras.length > 0) {
          mods.push({
            type: 'Extras',
            items: item.selectedExtras.map(extra => ({
              name: extra.name,
              price: extra.price
            }))
          });
        }
        
        // Add selected side orders
        if (item.selectedSideOrders && item.selectedSideOrders.length > 0) {
          // Group side orders by category
          const sideOrdersByCategory = item.selectedSideOrders.reduce((acc, sideOrder) => {
            const category = sideOrder.category || 'other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push({
              name: sideOrder.name,
              price: sideOrder.price
            });
            return acc;
          }, {});
          
          // Add each category as a separate modification type
          Object.entries(sideOrdersByCategory).forEach(([category, items]) => {
            const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
            mods.push({
              type: formattedCategory,
              items: items
            });
          });
        }
        
        return mods.length > 0 ? mods : null;
      };
      
      if (index === -1) {
        // Item not found, add as new
        const formattedTitle = getFormattedTitle(
          item.title, 
          item.type, 
          item.selectedExtras, 
          item.selectedSideOrders
        );
        
        const modifications = getModifications(item);
        
        return {
          items: [
            ...state.items,
            { 
              ...item, 
              quantity: 1, 
              title: formattedTitle,
              modifications: modifications,
              unitPrice: itemPrice // Store the unit price for later calculations
            }
          ],
          total: state.total + itemPrice,
          itemCount: state.itemCount + 1,
        };
      }
      
      // Item found, update quantity
      const newItems = [...state.items];
      const currentQuantity = newItems[index].quantity || 1;
      const newQuantity = currentQuantity + 1;
      
      const formattedTitle = getFormattedTitle(
        item.title, 
        item.type, 
        item.selectedExtras, 
        item.selectedSideOrders,
        newQuantity
      );
      
      newItems[index] = {
        ...newItems[index],
        quantity: newQuantity,
        title: formattedTitle,
      };
      
      return {
        items: newItems,
        total: state.total + itemPrice,
        itemCount: state.itemCount + 1,
      };
    }),

  updateItemQuantity: (index, newQuantity) => {
    if (newQuantity < 1) {
      return get().removeFromCart(index);
    }
    
    set((state) => {
      const newItems = [...state.items];
      const item = newItems[index];
      const oldQuantity = item.quantity || 1;
      
      // Use unitPrice for calculation to ensure accuracy
      const unitPrice = item.unitPrice || Number(item.price);
      const priceDifference = (newQuantity - oldQuantity) * unitPrice;
      
      // Update the formatted title with new quantity
      const baseTitleParts = item.title.split(" x");
      baseTitleParts.pop(); // Remove the quantity part
      const baseTitle = baseTitleParts.join(" x");
      
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
      const itemPrice = removedItem.unitPrice || Number(removedItem.price);
      
      return {
        items: newItems,
        total: state.total - itemPrice * (removedItem.quantity || 1),
        itemCount: state.itemCount - (removedItem.quantity || 1),
      };
    }),

  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));