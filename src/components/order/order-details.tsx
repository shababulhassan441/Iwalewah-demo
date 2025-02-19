// @components/order/order-details.tsx

import {
  OrderItemDocument,
  useOrderItemsQuery,
} from '@framework/order/get-order-items';
import usePrice from '@framework/product/use-price';
import { OrderItem } from '@framework/types';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Heading from '@components/ui/heading';
import { useEffect, useState } from 'react';
import { Order, useOrderQuery } from '@framework/order/get-order';

interface OrderDetailsProps {
  className?: string;
  orderId: string;
}

const OrderItemCard = ({ product }: { product: OrderItemDocument }) => {
  const { price: itemTotal } = usePrice({
    amount: product.price * product.quantity,
    currencyCode: 'GBP',
  });
  return (
    <tr
      className="font-normal border-b border-border-base last:border-b-0"
      key={product.$id}
    >
      <td className="p-4">
        {product.productName} * {product.quantity}
      </td>
      <td className="p-4">{itemTotal}</td>
    </tr>
  );
};

const OrderDetails: React.FC<OrderDetailsProps> = ({
  className = 'pt-10 lg:pt-12',
  orderId,
}) => {
  const { t } = useTranslation('common');

  const {
    data: orderItemsData,
    isLoading: isOrderItemsLoading,
    isError: isOrderItemsError,
    error: orderItemsError,
  } = useOrderItemsQuery({}, orderId);

  const {
    data: order,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useOrderQuery(orderId);

  const { price: subtotal } = usePrice(
    order && {
      amount: order.totalPrice,
      currencyCode: 'GBP',
    }
  );

  const { price: totalPrice } = usePrice(
    order && {
      amount: order.totalPrice,
      currencyCode: 'GBP',
    }
  );

  const { price: shippingRate } = usePrice(
    order && {
      amount: order.shippingRate,
      currencyCode: 'GBP',
    }
  );
  const { price: discountAmount } = usePrice(
    order && {
      amount: order.discountAmount,
      currencyCode: 'GBP',
    }
  );

  if (isOrderLoading || isOrderItemsLoading) return <p>Loading...</p>;
  if (isOrderError)
    return (
      <p className="mb-4 text-red-600">
        {orderError?.message || 'Error fetching order details.'}
      </p>
    );
  if (isOrderItemsError)
    return <p className="mb-4 text-red-600">{'Error fetching order items.'}</p>;
  if (!order) return <p className="mb-4 text-red-600">Order not found.</p>;

  return (
    <div className={className}>
      <Heading variant="heading" className="mb-6 xl:mb-7">
        {t('text-order-details')}:
      </Heading>
      <table className="w-full text-sm font-semibold text-brand-dark lg:text-base">
        <thead>
          <tr>
            <th className="w-1/2 p-4 bg-fill-secondary ltr:text-left rtl:text-right ltr:first:rounded-tl-md rtl:first:rounded-tr-md">
              {t('text-product')}
            </th>
            <th className="w-1/2 p-4 bg-fill-secondary ltr:text-left rtl:text-right ltr:last:rounded-tr-md rtl:last:rounded-tl-md">
              {t('text-total')}
            </th>
          </tr>
        </thead>
        <tbody>
          {orderItemsData?.data.map((product) => (
            <OrderItemCard key={product.$id} product={product} />
          ))}
        </tbody>
        <tfoot>
          <tr className="odd:bg-fill-secondary">
            <td className="p-4 italic">Discount Amount:</td>
            <td className="p-4">{discountAmount}</td>
          </tr>
          <tr className="odd:bg-fill-secondary">
            <td className="p-4 italic">{t('text-shipping')}:</td>
            <td className="p-4">
              {shippingRate}
              {/* <span className="text-[13px] font-normal ltr:pl-1.5 rtl:pr-1.5 inline-block">
                via Flat rate
              </span> */}
            </td>
          </tr>

          <tr className="odd:bg-fill-secondary">
            <td className="p-4 italic">{t('text-payment-method')}:</td>
            <td className="p-4">{order.paymentMethod}</td>
          </tr>
          <tr className="odd:bg-fill-secondary">
            <td className="p-4 italic">{t('text-total')}:</td>
            <td className="p-4">{totalPrice}</td>
          </tr>
          {/* Additional rows can be added here as needed */}
        </tfoot>
      </table>
    </div>
  );
};

export default OrderDetails;
