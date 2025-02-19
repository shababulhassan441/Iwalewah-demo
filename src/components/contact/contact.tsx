// components/Contact.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useCheckout } from '@components/checkout/checkout-context';
import { useAuth } from 'src/hooks/useAuth';
import debounce from 'lodash/debounce';
import Select, { StylesConfig, components } from 'react-select'; // Import components for custom DropdownIndicator
import { allCountries } from 'country-telephone-data';
import Flag from 'react-world-flags';

interface CountryOption {
  label: string;
  value: string;
  flag: string;
  name: string;
  dialCode: string;
}

const Contact: React.FC = () => {
  const { phoneNumber, setPhoneNumber, email, setEmail } = useCheckout();
  const { user, loading } = useAuth();
  const [tempPhoneNumber, setTempPhoneNumber] = useState<string>('');
  const [tempEmail, setTempEmail] = useState<string>('');
  const [emailValidationMessage, setEmailValidationMessage] = useState<
    string | null
  >(null);
  const [phoneValidationMessage, setPhoneValidationMessage] = useState<
    string | null
  >(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('gb'); // Default to United Kingdom
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);

  // Fetching all countries and their dial codes using country-telephone-data
  useEffect(() => {
    const formattedCountries = allCountries.map((country) => ({
      label: `+${country.dialCode}`,
      value: country.iso2.toLowerCase(),
      flag: country.iso2.toLowerCase(),
      name: country.name,
      dialCode: country.dialCode,
    }));
    setCountryOptions(formattedCountries);
  }, []);

  // Handler for phone number input changes
  const handleTempPhoneChange = (value: string) => {
    setTempPhoneNumber(value.replace(/[^0-9+ ()-]/g, '')); // Allow only valid characters
    setPhoneValidationMessage(null); // Reset validation message
  };

  // Handler for email input changes
  const handleTempEmailChange = (value: string) => {
    setTempEmail(value);
    setEmailValidationMessage(null); // Reset validation message
  };


    const validateEmail = useCallback(
      debounce(async (_email: string) => {
        return; // Skip validation
      }, 500),
      []
    );

  // Debounced email validation function
  // const validateEmail = useCallback(
  //   debounce(async (email: string) => {
  //     if (email) {
  //       try {
  //         const response = await fetch(
  //           `/api/validate-email?email=${encodeURIComponent(email)}`
  //         );
  //         const result = await response.json();
  //         if (response.ok && result.valid) {
  //           setEmailValidationMessage('Valid Email Address');
  //           setEmail(email); // Update useCheckout context
  //         } else if (result.error) {
  //           setEmailValidationMessage(result.error);
  //           setEmail(''); // Erase previous valid email
  //         } else {
  //           setEmailValidationMessage(
  //             'Invalid email address or does not exist'
  //           );
  //           setEmail(''); // Erase previous valid email
  //         }
  //       } catch (error) {
  //         setEmailValidationMessage('Error validating email address');
  //         setEmail(''); // Erase previous valid email
  //       }
  //     } else {
  //       setEmailValidationMessage(null);
  //       setEmail(''); // Erase previous valid email if input is empty
  //     }
  //   }, 500),
  //   [setEmail]
  // );

  // Debounced phone number validation function
  // const validatePhone = useCallback(
  //   debounce(async (phone: string, countryCode: string) => {
  //     if (phone) {
  //       try {
  //         const response = await fetch(
  //           `/api/validate-phone?phoneNumber=${encodeURIComponent(
  //             phone
  //           )}&country=${countryCode}`
  //         );
  //         const result = await response.json();
  //         if (response.ok && result.valid && result.on) {
  //           setPhoneValidationMessage('Valid phone number');
  //           setPhoneNumber(phone); // Update useCheckout context
  //         } else if (result.error) {
  //           setPhoneValidationMessage(result.error);
  //           setPhoneNumber(''); // Erase previous valid phone number
  //         } else {
  //           setPhoneValidationMessage(`Invalid phone number or doesn't exist`);
  //           setPhoneNumber(''); // Erase previous valid phone number
  //         }
  //       } catch (error: any) {
  //         setPhoneValidationMessage(
  //           `Error validating phone number: ${error.message}`
  //         );
  //         setPhoneNumber(''); // Erase previous valid phone number
  //       }
  //     } else {
  //       setPhoneValidationMessage(null);
  //       setPhoneNumber(''); // Erase previous valid phone number if input is empty
  //     }
  //   }, 500),
  //   [setPhoneNumber]
  // );

  const validatePhone = useCallback(
      debounce(async (_phone: string, _countryCode: string) => {
        return; // Skip validation
      }, 500),
      []
    );

  // Populate temp variables with user data on mount if available
  useEffect(() => {
    if (!loading && user) {
      if (user.email && !email) {
        setTempEmail(user.email);
        setEmail(user.email); // **Store in useCheckout context**
        setEmailValidationMessage('Valid Email Address'); // **Assume validity**
      }
      if (user.telephone && !phoneNumber) {
        setTempPhoneNumber(user.telephone);
        setPhoneNumber(user.telephone); // **Store in useCheckout context**
        setPhoneValidationMessage('Valid phone number'); // **Assume validity**
      }
    }
  }, [user, loading]);

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      validateEmail.cancel();
      validatePhone.cancel();
    };
  }, [validateEmail, validatePhone]);

  // Custom styles for react-select to ensure black text in options
  const customSelectStyles: StylesConfig<CountryOption, false> = {
    option: (provided) => ({
      ...provided,
      color: 'black', // Ensure text is black
      backgroundColor: 'white', // Ensure background is white
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'black', // Ensure selected value is black
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: '4px', // Decrease padding to reduce arrow size
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      minWidth: '20px', // Reduce the container width for the indicator
    }),
  };

  // Custom DropdownIndicator to further control the size if needed
  const DropdownIndicator = (props: any) => {
    return (
      <components.DropdownIndicator {...props}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-500"
        >
          <path
            d="M5 7L10 12L15 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </components.DropdownIndicator>
    );
  };

  // Custom filter function to search by dial code or country name
  const filterOption = (
    option: { label: string; value: string; data: CountryOption },
    inputValue: string
  ) => {
    const { name, dialCode } = option.data;
    const searchValue = inputValue.toLowerCase();

    return (
      dialCode.includes(searchValue) || name.toLowerCase().includes(searchValue)
    );
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto">
      <div className="flex flex-wrap">
        <div className="w-full">
          <form className="space-y-4">
            {/* Phone Number Field with Country Code Selector */}
            <div className="flex flex-col lg:w-8/12">
              <label
                htmlFor="phone"
                className="block mb-1 font-semibold text-gray-700"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                {/* Country Code Selector using react-select */}
                <div className="w-36 mr-2">
                  {' '}
                  {/* Increased width from w-32 to w-36 */}
                  <Select
                    options={countryOptions}
                    value={countryOptions.find(
                      (option) => option.value === selectedCountryCode
                    )}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setSelectedCountryCode(selectedOption.value);
                        setPhoneValidationMessage(null); // Reset validation message on country change
                        // Optionally, re-validate the phone number with the new country code
                        if (tempPhoneNumber) {
                          validatePhone(tempPhoneNumber, selectedOption.value);
                        }
                      }
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isSearchable
                    styles={customSelectStyles} // Apply custom styles
                    components={{ DropdownIndicator }} // Use custom DropdownIndicator
                    formatOptionLabel={(e) => (
                      <div className="flex items-center">
                        <Flag code={e.flag} className="w-5 h-5 mr-2" />{' '}
                        {/* Display the flag */}
                        <span>{e.label}</span> {/* Display country code */}
                      </div>
                    )}
                    filterOption={filterOption} // Apply custom filter
                    placeholder="Search by dial code or country name"
                  />
                </div>
                {/* Phone Number Input */}
                <input
                  type="tel"
                  id="phone"
                  value={tempPhoneNumber}
                  onChange={(e) => {
                    handleTempPhoneChange(e.target.value);
                    validatePhone(e.target.value, selectedCountryCode);
                  }}
                  className={`p-2 border border-gray-300 rounded-r w-full text-black focus:outline-none focus:ring-1 focus:ring-[#3F0071] focus:border-transparent ${
                    phoneValidationMessage === 'Valid phone number'
                      ? 'border-green-500'
                      : phoneValidationMessage
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
              {phoneValidationMessage && (
                <p
                  className={`mt-1 text-sm ${
                    phoneValidationMessage === 'Valid phone number'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {phoneValidationMessage}
                </p>
              )}
            </div>

            {/* Email Address Field */}
            <div className="flex flex-col lg:w-8/12">
              <label
                htmlFor="email"
                className="block mb-1 font-semibold text-gray-700"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={tempEmail}
                onChange={(e) => {
                  handleTempEmailChange(e.target.value);
                  validateEmail(e.target.value);
                }}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                className={`p-2 border rounded w-full text-black focus:outline-none focus:ring-1 focus:ring-[#3F0071] focus:border-transparent ${
                  emailValidationMessage === 'Valid Email Address'
                    ? 'border-green-500'
                    : emailValidationMessage
                    ? 'border-red-500'
                    : ''
                }`}
                placeholder="Enter email address"
              />
              {emailValidationMessage && (
                <p
                  className={`mt-1 text-sm ${
                    emailValidationMessage === 'Valid Email Address'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {emailValidationMessage}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
