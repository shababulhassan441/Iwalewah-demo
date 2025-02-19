import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CardPaymentDetails {
  cardHolderName: string;
  cardNumber: string;
  expiry: string;
  cardCode: string;
}

interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

interface CheckoutContextProps {
  customerFirstName: string;
  setCustomerFirstName: (firstName: string) => void;
  customerLastName: string;
  setCustomerLastName: (lastName: string) => void;

  // Delivery Address
  deliveryAddress: Address;
  setDeliveryAddress: (address: Address) => void;

  // Billing Address
  billingAddress: Address;
  setBillingAddress: (address: Address) => void;

  // Toggle for same as delivery
  sameAsDelivery: boolean;
  setSameAsDelivery: (same: boolean) => void;

  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  email: string;
  setEmail: (email: string) => void;
  paymentMethod: string;
  setPaymentMethod: (paymentMethod: string) => void;
  deliveryInstructions: string;
  setDeliveryInstructions: (instructions: string) => void;
  cardPaymentDetails: CardPaymentDetails;
  setCardPaymentDetails: (details: CardPaymentDetails) => void;
}

const CheckoutContext = createContext<CheckoutContextProps | undefined>(
  undefined
);

export const useCheckout = (): CheckoutContextProps => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
}) => {
  const [customerFirstName, setCustomerFirstName] = useState<string>('');
  const [customerLastName, setCustomerLastName] = useState<string>('');

  const [deliveryAddress, setDeliveryAddress] = useState<Address>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
  });

  const [sameAsDelivery, setSameAsDelivery] = useState<boolean>(true);

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');
  const [cardPaymentDetails, setCardPaymentDetails] =
    useState<CardPaymentDetails>({
      cardHolderName: '',
      cardNumber: '',
      expiry: '',
      cardCode: '',
    });

  // Effect to sync billing address with delivery address when toggle is on
  React.useEffect(() => {
    if (sameAsDelivery) {
      setBillingAddress({ ...deliveryAddress });
    }
  }, [sameAsDelivery, deliveryAddress]);

  return (
    <CheckoutContext.Provider
      value={{
        customerFirstName,
        setCustomerFirstName,
        customerLastName,
        setCustomerLastName,
        deliveryAddress,
        setDeliveryAddress,
        billingAddress,
        setBillingAddress,
        sameAsDelivery,
        setSameAsDelivery,
        phoneNumber,
        setPhoneNumber,
        email,
        setEmail,
        paymentMethod,
        setPaymentMethod,
        deliveryInstructions,
        setDeliveryInstructions,
        cardPaymentDetails,
        setCardPaymentDetails,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
};
