// src/components/order/order-details-content.tsx

import usePrice from '@framework/product/use-price';
import Image from '@components/ui/image';

export const OrderDetailsContent: React.FC<{ item?: any }> = ({ item }) => {
  const { price } = usePrice({
    amount: item.price,
    currencyCode: 'GBP',
  });

  return (
    <div className="relative grid grid-cols-12 py-2 pb-0 border-b border-solid border-border-base text-[12px] md:text-[14px]">
      <div className="self-center col-span-2">
        {/* Optionally, display product image
        <Image
          src={item?.images[0] || '/path/to/placeholder.jpg'}
          alt={item?.productName || 'Product Image'}
          width="60"
          height="60"
          quality={100}
          className="object-cover"
        />
        */}
      </div>
      <div className="self-center col-span-5 h-[60px]">
        <h2 className="text-brand-dark">{item.productName}</h2>
      </div>
      <div className="self-center col-span-3 text-center md:ltr:text-left md:rtl:text-right">
        {typeof item.quantity === 'number' && <p>{item.quantity}x</p>}
      </div>
      <div className="self-center col-span-2">
        {typeof item.price === 'number' && <p>{price}</p>}
      </div>
    </div>
  );
};

export default OrderDetailsContent;
