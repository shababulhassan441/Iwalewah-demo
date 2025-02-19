import React from 'react';
import Image from 'next/image'; // Import Image from Next.js
import { useCheckout } from './checkout-context';

// Import PNG images for the supported bank card logos
import Visa from '../../components/icons/bank-logos/Visa.png';
import MasterCard from '../../components/icons/bank-logos/MasterCard.png';
import Maestro from '../../components/icons/bank-logos/Maestro.png';
import DinersClub from '../../components/icons/bank-logos/DinersClub.png';
import Jcb from '../../components/icons/bank-logos/JCB.png';

// Format card number to XXXX XXXX XXXX XXXX
const formatCardNumber = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .slice(0, 16) // Limit to 16 digits
    .replace(/(.{4})/g, '$1 ') // Add space after every 4 digits
    .trim(); // Trim trailing spaces
};

// Format expiry to MM/YY for input field display
const formatExpiry = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .slice(0, 4) // Limit to 4 digits (MMYY)
    .replace(/(\d{2})(\d{1,2})?/, (match, mm, yy) => {
      if (yy) {
        return `${mm}/${yy}`;
      }
      return mm;
    });
};

// Convert expiry to MMYY format for storage
const convertExpiryToMMYY = (value: string) => {
  return value.replace('/', ''); // Remove the slash from MM/YY format
};

const PaymentMethod: React.FC = () => {
  const {
    paymentMethod,
    setPaymentMethod,
    cardPaymentDetails,
    setCardPaymentDetails,
  } = useCheckout();

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Allow only digits
    const numericValue = value.replace(/\D/g, '');

    // Apply formatting for card number and expiry
    let formattedValue = numericValue;
    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(numericValue);
    } else if (name === 'expiry') {
      // Format expiry for input display and storage
      formattedValue = formatExpiry(numericValue);
      const expiryMMYY = convertExpiryToMMYY(formattedValue);

      setCardPaymentDetails({
        ...cardPaymentDetails,
        expiry: expiryMMYY, // Store in MMYY format
      });

      return; // Exit early to avoid setting formatted value in this case
    }

    setCardPaymentDetails({
      ...cardPaymentDetails,
      [name]: formattedValue,
    });
  };

  // Label with line-through styling
  const LabelWithLine = ({ text }: { text: string }) => (
    <div className="flex items-center mb-2">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="mx-2 text-black text-sm font-semibold">{text}</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-black">
        Select Payment Method
      </h3>

      {/* Payment Options Container */}
      <div className="space-y-4 mb-6">
        {/* Direct Bank Transfer Option */}
        <div
          className={`border rounded-md p-4 cursor-pointer ${
            paymentMethod === 'directBankTransfer'
              ? 'border-primary bg-gray-50'
              : 'border-gray-300 hover:border-primary'
          }`}
          onClick={() => setPaymentMethod('directBankTransfer')}
        >
          <label className="flex items-start space-x-2 ">
            <input
              type="radio"
              value="directBankTransfer"
              checked={paymentMethod === 'directBankTransfer'}
              onChange={() => setPaymentMethod('directBankTransfer')}
              className="form-radio h-5 w-5 text-primary mt-1 "
            />
            <div className="flex flex-col ">
              <span className="font-medium text-black ml-1 ">
                Direct Bank Transfer
              </span>
              <small className="text-gray-600 mt-1 ml-1 ">
                Please click 'Order Now' to generate an Order ID, which you will
                need to use as the payment reference when making a direct bank
                transfer. Your order will only be shipped once the funds have
                cleared in our account.
              </small>
            </div>
          </label>
        </div>

        {/* Card Payment Option */}
        <div
          className={`border rounded-md p-4 cursor-pointer ${
            paymentMethod === 'cardPayment'
              ? 'border-primary bg-gray-50'
              : 'border-gray-300 hover:border-primary'
          }`}
          onClick={() => setPaymentMethod('cardPayment')}
        >
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="cardPayment"
              checked={paymentMethod === 'cardPayment'}
              onChange={() => setPaymentMethod('cardPayment')}
              className="form-radio h-5 w-5 text-primary"
            />
            <span className="font-medium text-black ml-1 ">Card Payment</span>
          </label>
        </div>
      </div>

      {paymentMethod === 'cardPayment' && (
        <>
          {/* Separator */}
          <hr className="my-6 border-t-2 border-gray-300" />

          {/* Card Details Heading */}
          <h3 className="text-lg font-semibold mb-4 text-black">
            Enter Card Details
          </h3>

          {/* Supported Card Icons */}
          <div className="flex items-center space-x-4 mb-4">
            <Image
              src={Visa}
              alt="Visa"
              height={50}
              width={50}
              className="object-contain"
            />
            <Image
              src={MasterCard}
              alt="MasterCard"
              height={35}
              width={55}
              className="object-contain"
            />
            <Image
              src={DinersClub}
              alt="Diners Club"
              height={30}
              width={50}
              className="object-contain"
            />
            <Image
              src={Jcb}
              alt="JCB"
              height={25}
              width={50}
              className="object-contain"
            />
            <Image
              src={Maestro}
              alt="Maestro"
              height={45}
              width={50}
              className="object-contain"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col relative">
              <LabelWithLine text="Card Number" />
              <input
                type="tel"
                name="cardNumber"
                placeholder="•••• •••• •••• ••••"
                value={cardPaymentDetails.cardNumber}
                onChange={handleCardDetailsChange}
                required
                maxLength={19} // 16 digits + 3 spaces
                inputMode="numeric"
                pattern="\d*"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent text-black"
              />
            </div>

            {/* Remaining fields for card details */}
            <div className="flex flex-col">
              <LabelWithLine text="Card Holder Name" />
              <input
                type="text"
                name="cardHolderName"
                value={cardPaymentDetails.cardHolderName}
                onChange={(e) => {
                  const { name, value } = e.target;
                  setCardPaymentDetails({
                    ...cardPaymentDetails,
                    [name]: value.replace(/[^\w\s]/gi, ''), // Remove any non-word characters
                  });
                }}
                required
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent text-black"
              />
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col flex-1">
                <LabelWithLine text="Expiry (MM/YY)" />
                <input
                  type="tel"
                  name="expiry"
                  placeholder="MM/YY"
                  value={formatExpiry(cardPaymentDetails.expiry)} // Display formatted expiry
                  onChange={handleCardDetailsChange}
                  required
                  maxLength={5} // MM/YY format
                  inputMode="numeric"
                  pattern="\d*"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent text-black"
                />
              </div>
              <div className="flex flex-col flex-1">
                <LabelWithLine text="Card Code" />
                <input
                  type="tel"
                  name="cardCode"
                  placeholder="CVC"
                  value={cardPaymentDetails.cardCode}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    // Allow only digits and limit to 4 characters
                    const numericValue = value.replace(/\D/g, '').slice(0, 4);
                    setCardPaymentDetails({
                      ...cardPaymentDetails,
                      [name]: numericValue,
                    });
                  }}
                  required
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\d*"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent text-black"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethod;
