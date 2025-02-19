// src/components/product/add-to-cart.tsx

import React, { useState, useEffect } from 'react';
import Counter from '@components/ui/counter';
import { useCart } from '@contexts/cart/cart.context';
import { generateCartItem } from '@utils/generate-cart-item';
import PlusIcon from '@components/icons/plus-icon';
import useWindowSize from '@utils/use-window-size';

interface Props {
  data: any;
  variation?: any;
  disabled?: boolean;
}
const AddToCart = ({ data, variation, disabled }: Props) => {
  const { width } = useWindowSize();
  const {
    addItemToCart,
    removeItemFromCart,
    clearItemFromCart,
    isInStock,
    getItemFromCart,
    isInCart,
  } = useCart();

  const [item, setItem] = useState<any>(null);

  // Determine minimum quantity
  const minQuantity = data.isWholesaleProduct
    ? data.minimumPurchaseQuantity || 1
    : 1;

  const handleAddClick = (
    e: React.MouseEvent<HTMLButtonElement | MouseEvent>
  ) => {
    e.stopPropagation();
    if (item) {
      addItemToCart(item, isInCart(item.id) ? 1 : minQuantity);
    }
  };

  const handleRemoveClick = (e: any) => {
    e.stopPropagation();
    if (item) {
      const currentQuantity = getItemFromCart(item.id).quantity;
      if (currentQuantity > minQuantity) {
        removeItemFromCart(item.id);
      } else {
        clearItemFromCart(item.id);
      }
    }
  };

  const outOfStock = item && isInCart(item.id) && !isInStock(item.id);
  const iconSize = width! > 480 ? '19' : '17';
  const maxQuantity = item ? item.stock || data.stockQuantity || 0 : 0;
  const itemQuantity = item ? getItemFromCart(item.id)?.quantity || 0 : 0;

  // Fetch the cart item data asynchronously
  useEffect(() => {
    async function fetchItem() {
      const cartItem = await generateCartItem(data, variation);
      setItem(cartItem);
    }
    fetchItem();
  }, [data, variation]);

  return !item || !isInCart(item.id) ? (
    <button
      className="flex items-center justify-center w-8 h-8 text-4xl rounded-full bg-brand lg:w-10 lg:h-10 text-brand-light focus:outline-none"
      aria-label="Count Button"
      onClick={handleAddClick}
      disabled={disabled || outOfStock}
    >
      <PlusIcon width={iconSize} height={iconSize} opacity="1" />
    </button>
  ) : (
    <Counter
      value={itemQuantity}
      onDecrement={handleRemoveClick}
      onIncrement={(e) => {
        if (itemQuantity < maxQuantity) {
          handleAddClick(e);
        }
      }}
      disabled={outOfStock}
      className="w-full"
      min={minQuantity}
      max={maxQuantity}
    />
  );
};

export default AddToCart;
