// src/components/order/price.tsx

import React from 'react';
import usePrice from '@framework/product/use-price';

export const TotalPrice: React.FC<{ items: any }> = ({ items }) => {
  const { price } = usePrice({
    amount: items.totalPrice,
    currencyCode: 'GBP',
  });

  return <span>{price}</span>;
};

// Similarly, define SubTotalPrice, DiscountPrice, DeliveryFee if needed
