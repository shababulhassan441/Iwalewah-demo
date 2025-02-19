// src/contexts/cart/cart.context.tsx

import React, { useCallback } from 'react';
import { cartReducer, State, initialState } from './cart.reducer';
import { Item, getItem, inStock } from './cart.utils';
import { useLocalStorage } from '@utils/use-local-storage';

interface CartProviderState extends State {
  addItemToCart: (item: Item, quantity: number) => void;
  removeItemFromCart: (id: Item['id']) => void;
  clearItemFromCart: (id: Item['id']) => void;
  getItemFromCart: (id: Item['id']) => any | undefined;
  isInCart: (id: Item['id']) => boolean;
  isInStock: (id: Item['id']) => boolean;
  resetCart: () => void;
}
export const cartContext = React.createContext<CartProviderState | undefined>(
  undefined
);

cartContext.displayName = 'CartContext';

export const useCart = () => {
  const context = React.useContext(cartContext);
  if (context === undefined) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return context;
};

// export const CartProvider: React.FC = (props) => {
//   const [savedCart, saveCart] = useLocalStorage(
//     `borobazar-cart`,
//     JSON.stringify(initialState)
//   );
//   const [state, dispatch] = React.useReducer(
//     cartReducer,
//     JSON.parse(savedCart!)
//   );

//   React.useEffect(() => {
//     saveCart(JSON.stringify(state));
//   }, [state, saveCart]);

//   const addItemToCart = (item: Item, quantity: number) => {
//     const itemInCart = getItem(state.items, item.id);
//     if (itemInCart) {
//       // Item is already in the cart, add the quantity
//       dispatch({ type: 'ADD_ITEM_WITH_QUANTITY', item, quantity });
//     } else {
//       // Item not in cart, enforce minQuantity
//       const minQuantity = item.isWholesaleProduct
//         ? item.minimumPurchaseQuantity || 1
//         : 1;
//       const addQuantity = Math.max(quantity, minQuantity);
//       dispatch({ type: 'ADD_ITEM_WITH_QUANTITY', item, quantity: addQuantity });
//     }
//   };

//   const removeItemFromCart = (id: Item['id']) =>
//     dispatch({ type: 'REMOVE_ITEM_OR_QUANTITY', id });
//   const clearItemFromCart = (id: Item['id']) =>
//     dispatch({ type: 'REMOVE_ITEM', id });
//   const isInCart = useCallback(
//     (id: Item['id']) => !!getItem(state.items, id),
//     [state.items]
//   );
//   const getItemFromCart = useCallback(
//     (id: Item['id']) => getItem(state.items, id),
//     [state.items]
//   );
//   const isInStock = useCallback(
//     (id: Item['id']) => inStock(state.items, id),
//     [state.items]
//   );
//   const resetCart = () => dispatch({ type: 'RESET_CART' });
//   const value = React.useMemo(
//     () => ({
//       ...state,
//       addItemToCart,
//       removeItemFromCart,
//       clearItemFromCart,
//       getItemFromCart,
//       isInCart,
//       isInStock,
//       resetCart,
//     }),
//     [getItemFromCart, isInCart, isInStock, state]
//   );
//   return <cartContext.Provider value={value} {...props} />;
// };


export const CartProvider: React.FC = (props) => {
  const isDemoUser = typeof window !== "undefined" && sessionStorage.getItem("isDemo") === "true";

  // Use sessionStorage for demo users, otherwise localStorage
  const storageKey = isDemoUser ? "demo-cart" : "borobazar-cart";
  
  const [savedCart, saveCart] = useLocalStorage(storageKey, JSON.stringify(initialState));
  const [state, dispatch] = React.useReducer(cartReducer, JSON.parse(savedCart!));

  React.useEffect(() => {
    if (isDemoUser) {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } else {
      saveCart(JSON.stringify(state));
    }
  }, [state, saveCart, isDemoUser, storageKey]);

  // Clear demo cart on page unload
  React.useEffect(() => {
    const clearDemoCart = () => {
      if (isDemoUser) {
        sessionStorage.removeItem(storageKey);
      }
    };

    window.addEventListener("beforeunload", clearDemoCart);
    return () => window.removeEventListener("beforeunload", clearDemoCart);
  }, [isDemoUser, storageKey]);

  const addItemToCart = (item: Item, quantity: number) => {
    const itemInCart = getItem(state.items, item.id);
    if (itemInCart) {
      dispatch({ type: "ADD_ITEM_WITH_QUANTITY", item, quantity });
    } else {
      const minQuantity = item.isWholesaleProduct
        ? item.minimumPurchaseQuantity || 1
        : 1;
      const addQuantity = Math.max(quantity, minQuantity);
      dispatch({ type: "ADD_ITEM_WITH_QUANTITY", item, quantity: addQuantity });
    }
  };

  const removeItemFromCart = (id: Item["id"]) =>
    dispatch({ type: "REMOVE_ITEM_OR_QUANTITY", id });
  const clearItemFromCart = (id: Item["id"]) =>
    dispatch({ type: "REMOVE_ITEM", id });
  const isInCart = useCallback(
    (id: Item["id"]) => !!getItem(state.items, id),
    [state.items]
  );
  const getItemFromCart = useCallback(
    (id: Item["id"]) => getItem(state.items, id),
    [state.items]
  );
  const isInStock = useCallback(
    (id: Item["id"]) => inStock(state.items, id),
    [state.items]
  );
  const resetCart = () => dispatch({ type: "RESET_CART" });

  const value = React.useMemo(
    () => ({
      ...state,
      addItemToCart,
      removeItemFromCart,
      clearItemFromCart,
      getItemFromCart,
      isInCart,
      isInStock,
      resetCart,
    }),
    [getItemFromCart, isInCart, isInStock, state]
  );

  return <cartContext.Provider value={value} {...props} />;
};
