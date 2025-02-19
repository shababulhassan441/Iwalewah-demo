// @components/order/order-information.tsx

import { IoCheckmarkCircle } from 'react-icons/io5';
import OrderDetails from '@components/order/order-details';
import { useOrderQuery } from '@framework/order/get-order';
import usePrice from '@framework/product/use-price';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

interface OrderInformationProps {
  orderId: string;
}

export default function OrderInformation({ orderId }: OrderInformationProps) {
  const { t } = useTranslation('common');

  const { data, isLoading, isError, error } = useOrderQuery(orderId);

  const [formattedDate, setFormattedDate] = useState<string>('');

  const { price: totalPrice } = usePrice(
    data && {
      amount: data.totalPrice,
      currencyCode: 'GBP',
    }
  );

  useEffect(() => {
    if (data && data.createdAt) {
      const date = new Date(data.createdAt);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      setFormattedDate(date.toLocaleDateString(undefined, options));
    }
  }, [data]);

  if (isLoading) return <p>{t('text-loading')}</p>;
  if (isError)
    return (
      <p className="mb-4 text-red-600">
        {error?.message || t('text-error-fetching-order')}
      </p>
    );
  if (!data)
    return <p className="mb-4 text-red-600">{t('text-order-not-found')}</p>;

  return (
    <div className="py-16 xl:px-32 2xl:px-44 3xl:px-56 lg:py-20">
      <div className="flex items-center justify-start px-4 py-4 mb-6 text-sm border rounded-md border-border-base bg-fill-secondary lg:px-5 text-brand-dark md:text-base lg:mb-8">
        <span className="flex items-center justify-center w-10 h-10 rounded-full ltr:mr-3 rtl:ml-3 lg:ltr:mr-4 lg:rtl:ml-4 bg-brand bg-opacity-20 shrink-0">
          <IoCheckmarkCircle className="w-5 h-5 text-brand" />
        </span>
        {t('text-order-received')}
      </div>

      <ul className="flex flex-col border rounded-md border-border-base bg-fill-secondary md:flex-row mb-7 lg:mb-8 xl:mb-10">
        <li className="px-4 py-4 text-base font-semibold border-b border-dashed text-brand-dark lg:text-lg md:border-b-0 md:border-r border-border-two lg:px-6 xl:px-8 md:py-5 lg:py-6 last:border-0">
          <span className="block text-xs font-normal leading-5 uppercase text-brand-muted">
            Order Id:
          </span>
          # {data.orderId}
        </li>
        <li className="px-4 py-4 text-base font-semibold border-b border-gray-300 border-dashed text-brand-dark lg:text-lg md:border-b-0 md:border-r lg:px-6 xl:px-8 md:py-5 lg:py-6 last:border-0">
          <span className="uppercase text-[11px] block text-brand-muted font-normal leading-5">
            {t('text-date')}:
          </span>
          {formattedDate}
        </li>
        <li className="px-4 py-4 text-base font-semibold border-b border-gray-300 border-dashed text-brand-dark lg:text-lg md:border-b-0 md:border-r lg:px-6 xl:px-8 md:py-5 lg:py-6 last:border-0">
          <span className="uppercase text-[11px] block text-brand-muted font-normal leading-5">
            {t('text-email')}:
          </span>
          {data.email}
        </li>
        <li className="px-4 py-4 text-base font-semibold border-b border-gray-300 border-dashed text-brand-dark lg:text-lg md:border-b-0 md:border-r lg:px-6 xl:px-8 md:py-5 lg:py-6 last:border-0">
          <span className="uppercase text-[11px] block text-brand-muted font-normal leading-5">
            {t('text-total')}:
          </span>
          {totalPrice}
        </li>
        <li className="px-4 py-4 text-base font-semibold border-b border-gray-300 border-dashed text-brand-dark lg:text-lg md:border-b-0 md:border-r lg:px-6 xl:px-8 md:py-5 lg:py-6 last:border-0">
          <span className="uppercase text-[11px] block text-brand-muted font-normal leading-5">
            {t('text-payment-method')}:
          </span>
          {data.paymentMethod}
        </li>
      </ul>

      {/* <p className="mb-8 text-sm text-brand-dark md:text-base">
        {t('text-pay-cash')}
      </p> */}

      <OrderDetails orderId={orderId} />
    </div>
  );
}
