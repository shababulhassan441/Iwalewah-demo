// components/checkout-card.tsx

import Link from 'next/link';
import usePrice from '@framework/product/use-price';
import { useCart } from '@contexts/cart/cart.context';
import Text from '@components/ui/text';
import Button from '@components/ui/button';
import { CheckoutItem } from '@components/checkout/checkout-card-item';
import { CheckoutCardFooterItem } from './checkout-card-footer-item';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import { useCheckout } from './checkout-context';
import { useEffect, useState } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { ROUTES } from '@utils/routes';
import useShippingRate from '@framework/shipping-rates/useShippingRate';
import Voucher from './voucher';

const CheckoutCard: React.FC = () => {
  const { t } = useTranslation('common');
  const { items, total, isEmpty } = useCart();
  const { price: subtotal } = usePrice({
    amount: total,
    currencyCode: 'GBP',
  });
  // State for discount code and discounted total
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [voucherId, setVoucherId] = useState<string | null>(null);

  // Use the useShippingRate hook to fetch the shipping rate
  const {
    shippingRate,
    FreeDeliveryThreshold,
    loading: shippingLoading,
    error: shippingError,
  } = useShippingRate();

  // Determine eligibility for free shipping
  const isEligibleForFreeShipping =
    FreeDeliveryThreshold !== null && total >= FreeDeliveryThreshold;

  // Determine the effective shipping rate
  const effectiveShippingRate = isEligibleForFreeShipping ? 0 : shippingRate;

  // Format the shipping rate using the usePrice hook
  const { price: shippingPrice } = usePrice({
    amount: effectiveShippingRate || 0, // Default to 0 if shippingRate is null
    currencyCode: 'GBP',
  });

  // Calculate the amount needed to reach free shipping
  const amountNeededForFreeShipping =
    FreeDeliveryThreshold !== null ? FreeDeliveryThreshold - total : 0;

  // Optional: Update the total to include shipping rate and discount
  const { price: totalPrice } = usePrice({
    amount: total + (effectiveShippingRate || 0) - discountAmount,
    currencyCode: 'GBP',
  });

  // Destructure necessary fields from the Checkout Context
  const {
    customerFirstName,
    customerLastName,
    deliveryAddress, // Added: Delivery Address
    billingAddress,
    sameAsDelivery, // Added: Toggle for same as delivery
    phoneNumber,
    email,
    paymentMethod,
    deliveryInstructions,
    cardPaymentDetails,
  } = useCheckout();

  const { user, loading } = useAuth();
  const userId = user ? user.userId : null;

  // Validation for Delivery Address
  const isDeliveryAddressComplete =
    deliveryAddress.addressLine1 &&
    deliveryAddress.city &&
    deliveryAddress.country &&
    deliveryAddress.postalCode &&
    deliveryAddress.region;

  // Validation for Billing Address
  const isBillingAddressComplete = sameAsDelivery
    ? isDeliveryAddressComplete
    : billingAddress.addressLine1 &&
      billingAddress.city &&
      billingAddress.country &&
      billingAddress.postalCode &&
      billingAddress.region;

  // Validation for Card Payment Details (if applicable)
  const isCardPaymentComplete =
    paymentMethod !== 'cardPayment' ||
    (cardPaymentDetails.cardHolderName &&
      cardPaymentDetails.cardNumber &&
      cardPaymentDetails.expiry &&
      cardPaymentDetails.cardCode);

  // Overall form validation
  const isReadyToOrder =
    customerFirstName &&
    customerLastName &&
    isDeliveryAddressComplete &&
    isBillingAddressComplete &&
    phoneNumber &&
    email &&
    paymentMethod &&
    isCardPaymentComplete;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // State for processing

  const { price: discountedTotalPrice } = usePrice({
    amount: total + (effectiveShippingRate || 0) - discountAmount,
    currencyCode: 'GBP',
  });

  const handleApplyDiscount = (
    code: string,
    discountPercentage: number,
    id: string
  ) => {
    setDiscountCode(code);
    const amount = (discountPercentage / 100) * total;
    setDiscountAmount(amount);
    setVoucherId(id);
  };

  async function handleCheckout() {
    if (!isEmpty && isReadyToOrder) {
      setErrorMessage(null);
      setIsProcessing(true); // Start processing

      // Prepare individual fields for checkoutData
      const checkoutData = {
        // Customer Details
        customerFirstName,
        customerLastName,
        phoneNumber,
        email,
        paymentMethod,
        deliveryInstructions,
        cardPaymentDetails,

        // Delivery Address Fields
        deliveryAddressLine1: deliveryAddress.addressLine1,
        deliveryAddressLine2: deliveryAddress.addressLine2 || '',
        deliveryCity: deliveryAddress.city,
        deliveryRegion: deliveryAddress.region,
        deliveryPostalCode: deliveryAddress.postalCode,
        deliveryCountry: deliveryAddress.country,

        // Billing Address Fields
        billingAddressLine1: sameAsDelivery
          ? deliveryAddress.addressLine1
          : billingAddress.addressLine1,
        billingAddressLine2: sameAsDelivery
          ? deliveryAddress.addressLine2 || ''
          : billingAddress.addressLine2 || '',
        billingCity: sameAsDelivery
          ? deliveryAddress.city
          : billingAddress.city,
        billingRegion: sameAsDelivery
          ? deliveryAddress.region
          : billingAddress.region,
        billingPostalCode: sameAsDelivery
          ? deliveryAddress.postalCode
          : billingAddress.postalCode,
        billingCountry: sameAsDelivery
          ? deliveryAddress.country
          : billingAddress.country,

        // Shipping Rate
        shippingRate: effectiveShippingRate, // Use effectiveShippingRate

        // Voucher details
        voucherCode: discountCode || null,
        discountAmount: discountAmount || null,
        voucherId: voucherId || null, // Include voucherId
      };

      // Define success and failure URLs
      const successUrl = `${window.location.origin}/complete-order`;
      const failureUrl = `${window.location.origin}/checkout?error=true`;

      try {
        const response = await axios.post(
          '/api/checkout',
          {
            checkoutData,
            items: items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            successUrl,
            failureUrl,
          },
          {
            headers: {
              'x-appwrite-user-id': userId || 'User not Logged In',
              'Content-Type': 'application/json',
            },
          }
        );

        // Handle redirection based on payment method and response
        if (
          paymentMethod === 'cardPayment' ||
          paymentMethod === 'directBankTransfer' // Updated payment method value
        ) {
          if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
          } else if (response.data.orderId) {
            window.location.href = `/complete-order/${response.data.orderId}`;
          }
        }
      } catch (error: any) {
        console.error('Error initiating checkout:', error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('An unexpected error occurred.');
        }
      } finally {
        setIsProcessing(false); // End processing
      }
    }
  }

  // Define the checkout footer items with dynamic shipping rate and discount
  const checkoutFooter = [
    {
      id: 1,
      name: t('text-sub-total'),
      price: subtotal,
    },
    {
      id: 2,
      name: t('text-shipping'),
      price: shippingPrice, // Updated to use effectiveShippingRate
    },
    {
      id: 3,
      name: 'Discount',
      price: discountAmount ? `-£${discountAmount.toFixed(2)}` : '£0.00',
    },
    {
      id: 4,
      name: t('text-total'),
      price: discountedTotalPrice,
    },
  ];

  // useEffect(() => {
  //   console.log('Delivery Address: ', deliveryAddress);
  //   console.log('Billing Address: ', billingAddress);
  // });

  return (
    <>
      <div className="px-4 py-1 border rounded-md border-border-base text-brand-light xl:py-6 xl:px-7">
        {/* Order Summary Header */}
        <div className="flex pb-2 text-sm font-semibold rounded-md text-heading">
          <span className="font-medium text-15px text-brand-dark">
            {t('text-product')}
          </span>
          <span className="font-medium ltr:ml-auto rtl:mr-auto shrink-0 text-15px text-brand-dark">
            {t('text-sub-total')}
          </span>
        </div>

        {/* List of Checkout Items */}
        {!isEmpty ? (
          items.map((item) => <CheckoutItem item={item} key={item.id} />)
        ) : (
          <p className="py-4 text-brand-danger text-opacity-70">
            {t('text-empty-cart')}
          </p>
        )}

        {/* Voucher Component */}
        <Voucher onApply={handleApplyDiscount} />

        {/* Checkout Footer Items */}
        {checkoutFooter.map((item: any) => (
          <CheckoutCardFooterItem item={item} key={item.id} />
        ))}

        {/* Notification Message for Free Shipping */}
        {!shippingLoading && FreeDeliveryThreshold !== null && (
          <div
            className={`mt-4 py-3 px-2 rounded-md ${
              isEligibleForFreeShipping
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isEligibleForFreeShipping ? (
              <span className="font-semibold">
                Congratulations you got free shipping
              </span>
            ) : (
              <span>
                Get free shipping by ordering £
                {amountNeededForFreeShipping.toFixed(2)} more
              </span>
            )}
          </div>
        )}
        {/* Display Error Message if Any */}
        {errorMessage && (
          <div className="mt-6 text-red-600">{errorMessage}</div>
        )}

        {/* Proceed to Checkout Button */}
        <Button
          variant="formButton"
          className={`w-full mt-3 mb-5 bg-brand text-brand-light rounded font-semibold px-4 py-3 transition-all ${
            !isReadyToOrder || isEmpty ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          onClick={handleCheckout}
          disabled={!isReadyToOrder || isEmpty || isProcessing} // Disable if not ready or processing
        >
          {isProcessing ? (
            <>
              Processing...
              <span className="loader ml-2"></span> {/* Loader Icon */}
            </>
          ) : (
            t('button-order-now')
          )}
        </Button>
      </div>

      {/* Terms and Conditions */}
      <Text className="mt-8">
        {t('text-by-placing-your-order')}{' '}
        <Link href={ROUTES.TERMS}>
          <a className="font-medium underline text-brand">
            {t('text-terms-of-service')}
          </a>
        </Link>
        {t('text-and')}{' '}
        <Link href={ROUTES.PRIVACY}>
          <a className="font-medium underline text-brand">
            {t('text-privacy')}
          </a>
        </Link>
        . {t('text-credit-debit')}
      </Text>

      {/* Additional Information */}
      <Text className="mt-4">{t('text-bag-fee')}</Text>
    </>
  );
};

export default CheckoutCard;
