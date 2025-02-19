// src/components/order/order-drawer.tsx

import { OrderDetailsContent } from './order-details-content';
import { formatAddress } from '@utils/format-address';
import Heading from '@components/ui/heading';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import { TotalPrice } from '@components/order/price';
import { useUI } from '@contexts/ui.context';
import { useOrderItemsQuery } from '@framework/order/get-order-items'; // Import the new hook

const OrderDrawer: React.FC = () => {
  const { t } = useTranslation('common');
  const { data, closeDrawer } = useUI();

  const orderId = data?.$id || null; // Assuming data contains the order document

  const {
    data: orderItemsData,
    isLoading: isOrderItemsLoading,
    error: orderItemsError,
  } = useOrderItemsQuery({}, orderId);

  return (
    <>
      {data && (
        <div className="block">
          <div className="relative flex items-center justify-between w-full border-b ltr:pl-5 rtl:pr-5 md:ltr:pl-7 md:rtl:pr-7 border-border-base">
            <Heading variant="titleMedium">{t('text-order-details')}:</Heading>
            <button
              className="flex items-center justify-center px-4 py-6 text-2xl transition-opacity md:px-6 lg:py-7 focus:outline-none text-brand-dark hover:opacity-60"
              onClick={closeDrawer}
              aria-label="close"
            >
              <IoClose />
            </button>
          </div>
          <div className="p-5 md:p-8">
            <div className="text-[14px] opacity-70 mb-3 text-brand-dark">
              Address
            </div>
            <div className="rounded border border-solid min-h-[90px] bg-fill-base p-4 border-border-two text-[12px] md:text-[14px] mb-2">
              <p className="text-brand-dark opacity-70">
                Delivery Address: {data.deliveryAddressLine1},{' '}
                {data.deliveryAddressLine2}, {data.deliveryCity},{' '}
                {data.deliveryRegion}, {data.deliveryPostalCode},{' '}
                {data.deliveryCountry}
              </p>
              <p className="text-brand-dark opacity-70">
                Billing Address: {data.billingAddressLine1},{' '}
                {data.billingAddressLine2}, {data.billingCity},{' '}
                {data.billingRegion}, {data.billingPostalCode},{' '}
                {data.billingCountry}
              </p>
            </div>
            {/* Optionally, display Order Status */}
            {/* <OrderStatus status={data?.orderStatus} /> */}
            <div className="grid grid-cols-12 bg-fill-base py-3 rounded-[3px] text-brand-dark/70 text-[12px] md:text-[14px]">
              <div className="col-span-2"></div>
              <div className="col-span-5">Item Name</div>
              <div className="col-span-3 text-center md:ltr:text-left md:rtl:text-right">
                Quantity
              </div>
              <div className="col-span-2">Price</div>
            </div>
            {isOrderItemsLoading ? (
              <div>Loading Order Items...</div>
            ) : orderItemsError ? (
              <div>Error loading order items</div>
            ) : (
              orderItemsData?.data.map((item: any) => (
                <OrderDetailsContent key={item.$id} item={item} />
              ))
            )}
            <div className="mt-3 ltr:text-right rtl:text-left">
              <div className="text-black inline-flex flex-col text-[12px] md:text-[14px]">
                <div className="pb-1 mb-2 border-b border-border-base ltr:pl-20 rtl:pr-20">
                  <p className="flex justify-between mb-1">
                    <span className="ltr:mr-8 rtl:ml-8">Sub total: </span>
                    <span className="font-medium">
                      £
                      {data.totalPrice +
                        data.discountAmount -
                        data.shippingRate}
                    </span>
                  </p>
                  <p className="flex justify-between mb-1">
                    <span className="ltr:mr-8 rtl:ml-8">Discount Amount: </span>
                    <span className="font-medium">£{data.discountAmount}</span>
                  </p>
                  <p className="flex justify-between mb-2">
                    <span className="ltr:mr-8 rtl:ml-8">Delivery Fee:</span>
                    <span className="font-medium">£{data.shippingRate}</span>
                  </p>
                  {/* )} */}
                </div>
                <p className="flex justify-between mb-2 ltr:pl-20 rtl:pr-20">
                  <span className="ltr:mr-8 rtl:ml-8">Total Cost:</span>
                  <span className="font-medium">
                    <TotalPrice items={data} />
                  </span>
                </p>
              </div>
            </div>
            {/* Uncomment if additional actions are needed
            <div className="mt-12 ltr:text-right rtl:text-left">
              <span className="py-3 px-5 cursor-pointer inline-block text-[12px] md:text-[14px] text-black font-medium bg-white rounded border border-solid border-[#DEE5EA] ltr:mr-4 rtl:ml-4 hover:bg-[#F35C5C] hover:text-white hover:border-[#F35C5C] transition-all capitalize">
                Report order
              </span>
              <span
                onClick={closeDrawer}
                className="py-3 px-5 cursor-pointer inline-block text-[12px] md:text-[14px] text-white font-medium bg-[#F35C5C] rounded border border-solid border-[#F35C5C]  hover:bg-white hover:text-black hover:border-[#DEE5EA] transition-all capitalize"
              >
                Cancel order
              </span>
            </div>
            */}
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDrawer;
