// components/CustomerName.tsx

import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useCheckout } from './checkout-context';
import { useAuth } from 'src/hooks/useAuth'; // Importing useAuth hook

const CustomerName: React.FC = () => {
  const { t } = useTranslation('common');
  const {
    customerFirstName,
    setCustomerFirstName,
    customerLastName,
    setCustomerLastName,
  } = useCheckout();

  const { user, loading } = useAuth(); // Using useAuth hook

  // Function to split full name into first and last name
  const splitFullName = (
    fullName: string
  ): { firstName: string; lastName: string } => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  // useEffect to auto-populate names if user is logged in
  useEffect(() => {
    if (!loading && user) {
      // Assuming UserDocument has a 'name' field containing the full name
      if (user.name && (!customerFirstName || !customerLastName)) {
        const { firstName, lastName } = splitFullName(user.name);
        if (firstName && !customerFirstName) {
          setCustomerFirstName(firstName);
        }
        if (lastName && !customerLastName) {
          setCustomerLastName(lastName);
        }
      }
    }
    // Dependencies ensure this runs when 'user', 'loading', 'customerFirstName', or 'customerLastName' changes
  }, [
    user,
    loading,
    setCustomerFirstName,
    setCustomerLastName,
    customerFirstName,
    customerLastName,
  ]);

  return (
    <div className="w-full max-w-[1300px] mx-auto">
      <div className="flex flex-wrap">
        <div className="w-full">
          <div className="flex space-x-4 mt-4">
            {/* First Name Field with Label */}
            <div className="flex-1">
              <label
                htmlFor="firstName"
                className="block mb-1 font-semibold text-gray-700"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={customerFirstName}
                onChange={(e) => setCustomerFirstName(e.target.value)}
                className="w-full mb-3 p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
              />
            </div>
            {/* Last Name Field with Label */}
            <div className="flex-1">
              <label
                htmlFor="lastName"
                className="block mb-1 font-semibold text-gray-700"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={customerLastName}
                onChange={(e) => setCustomerLastName(e.target.value)}
                className="w-full mb-3 p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerName;
