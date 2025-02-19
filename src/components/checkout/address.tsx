// components/checkout/address.tsx

import React, { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useCheckout } from './checkout-context';
import Select from 'react-select';
import { CountryOption, countries } from '../../data/countries';
import Toggle from './toggle';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';
import debounce from 'lodash.debounce'; // Import debounce

const Address: React.FC = () => {
  const { t } = useTranslation('common');
  const {
    deliveryAddress,
    setDeliveryAddress,
    billingAddress,
    setBillingAddress,
    sameAsDelivery,
    setSameAsDelivery,
  } = useCheckout();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // New state variables for managing address input and selection
  const [addressInput, setAddressInput] = useState<string>('');
  const [addressSelected, setAddressSelected] = useState<boolean>(false);

  // Refs for StandaloneSearchBox
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const handleSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };

  const handlePlacesChanged = async () => {
    const searchBox = searchBoxRef.current;
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];

        const formattedAddress: string | undefined = place.formatted_address;
        const addressComponents = place.address_components;

        if (!formattedAddress) {
          setErrorMessage(
            'Could not retrieve the formatted address. Please try again.'
          );
          setDeliveryAddress({
            addressLine1: '',
            addressLine2: '',
            city: '',
            region: '',
            postalCode: '',
            country: '',
          });
          setAddressInput('');
          setAddressSelected(false);
          return;
        }

        const getAddressComponent = (
          types: string[],
          type: string,
          useShortName: boolean = false
        ) => {
          const component = addressComponents?.find((comp) =>
            types.every((t) => comp.types.includes(t))
          );
          if (component) {
            return useShortName ? component.short_name : component.long_name;
          }
          return '';
        };

        const streetNumber = getAddressComponent(
          ['street_number'],
          'street_number'
        );
        const route = getAddressComponent(['route'], 'route');
        const city =
          getAddressComponent(['locality'], 'locality') ||
          getAddressComponent(['sublocality'], 'sublocality');
        const region = getAddressComponent(
          ['administrative_area_level_1'],
          'administrative_area_level_1'
        );
        const postalCode = getAddressComponent(['postal_code'], 'postal_code');
        const country = getAddressComponent(['country'], 'country', true); // Use short_name

        const addressLine1 =
          streetNumber && route ? `${streetNumber} ${route}`.trim() : '';

        // Check if addressLine1 is valid
        if (!addressLine1) {
          setErrorMessage('Please select a more specific address.');
          setDeliveryAddress({
            addressLine1: '',
            addressLine2: '',
            city: '',
            region: '',
            postalCode: '',
            country: '',
          });
          setAddressInput('');
          setAddressSelected(false);
          return;
        }

        const tempDeliveryAddress = {
          addressLine1,
          addressLine2: '', // Optional field
          city,
          region,
          postalCode,
          country,
        };

        // Update state with the selected address
        setDeliveryAddress(tempDeliveryAddress);
        setErrorMessage(null);
        setAddressInput(addressLine1); // Update the input field with the formatted address
        setAddressSelected(true); // Mark as a valid selection
      }
    }
  };

  const debouncedHandlePlacesChanged = debounce(handlePlacesChanged, 300);

  // Handler for address field changes (excluding Delivery Address Line 1)
  const handleAddressChange = (
    addressType: 'delivery' | 'billing',
    field: string,
    value: string
  ) => {
    if (addressType === 'delivery') {
      setDeliveryAddress({ ...deliveryAddress, [field]: value });
    } else {
      setBillingAddress({ ...billingAddress, [field]: value });
    }
  };

  // Handler for country selection changes
  const handleCountryChange = (
    addressType: 'delivery' | 'billing',
    option: CountryOption | null
  ) => {
    if (addressType === 'delivery') {
      setDeliveryAddress({
        ...deliveryAddress,
        country: option ? option.value : '',
      });
    } else {
      setBillingAddress({
        ...billingAddress,
        country: option ? option.value : '',
      });
    }
  };

  // Handler for input change in address field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
    setAddressSelected(false);
    // Optionally, you can clear the deliveryAddress.addressLine1 here if needed
    // setDeliveryAddress({ ...deliveryAddress, addressLine1: '' });
  };

  // Handler for input blur
  const handleInputBlur = () => {
    if (addressInput && !addressSelected) {
      // Clear the input if no address was selected
      setAddressInput('');
      setDeliveryAddress({
        addressLine1: '',
        addressLine2: '',
        city: '',
        region: '',
        postalCode: '',
        country: '',
      });
      setErrorMessage('Please select a valid address from the suggestions.');
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: '0.375rem',
      marginTop: '0.25rem',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3B82F6'
        : state.isFocused
        ? '#E5E7EB'
        : 'white',
      color: state.isSelected ? 'white' : 'black',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'black',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9CA3AF',
    }),
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto">
      {/* Delivery Address Section */}
      <div className="flex flex-wrap">
        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Delivery Address
          </h2>
          <hr className="my-6 border-t-2 border-gray-300" />
          <div className="rounded min-h-[112px] h-full mt-4">
            {/* Delivery Address Fields */}

            {/* Delivery Address Line 1 with Autocomplete */}
            <div className="mb-3">
              <label
                htmlFor="deliveryAddressLine1"
                className="block mb-1 font-semibold text-gray-700"
              >
                Address <span className="text-red-500">*</span>
              </label>
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}
                libraries={['places'] as const}
              >
                <StandaloneSearchBox
                  onLoad={handleSearchBoxLoad}
                  onPlacesChanged={debouncedHandlePlacesChanged}
                >
                  <input
                    id="deliveryAddressLine1"
                    placeholder="Enter your address"
                    type="text"
                    value={addressInput}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                  />
                </StandaloneSearchBox>
              </LoadScript>
            </div>

            {/* The rest of the Delivery Address Fields */}
            <div className="mb-3">
              <label
                htmlFor="deliveryAddressLine2"
                className="block mb-1 font-semibold text-gray-700"
              >
                Apartment, suite, unit, etc. (Optional)
              </label>
              <input
                id="deliveryAddressLine2"
                type="text"
                value={deliveryAddress.addressLine2}
                onChange={(e) =>
                  handleAddressChange(
                    'delivery',
                    'addressLine2',
                    e.target.value
                  )
                }
                className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4 mb-3">
              <div className="flex-1">
                <label
                  htmlFor="deliveryCity"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Town/City <span className="text-red-500">*</span>
                </label>
                <input
                  id="deliveryCity"
                  type="text"
                  value={deliveryAddress.city}
                  onChange={(e) =>
                    handleAddressChange('delivery', 'city', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="deliveryRegion"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Region/Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="deliveryRegion"
                  type="text"
                  value={deliveryAddress.region}
                  onChange={(e) =>
                    handleAddressChange('delivery', 'region', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-4 mb-3">
              <div className="flex-1">
                <label
                  htmlFor="deliveryPostalCode"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="deliveryPostalCode"
                  type="text"
                  value={deliveryAddress.postalCode}
                  onChange={(e) =>
                    handleAddressChange(
                      'delivery',
                      'postalCode',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="deliveryCountry"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Country <span className="text-red-500">*</span>
                </label>
                <Select
                  id="deliveryCountry"
                  value={countries.find(
                    (option) => option.value === deliveryAddress.country
                  )}
                  options={countries}
                  onChange={(selectedOption) =>
                    handleCountryChange('delivery', selectedOption)
                  }
                  styles={customSelectStyles}
                  placeholder={t('select-country')}
                />
              </div>
            </div>

            {/* Display error message if any */}
            {errorMessage && (
              <div className="mb-3">
                <p className="text-red-500">{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle for Billing Address */}
      <div className="flex items-center mt-6 mb-8">
        <Toggle
          id="sameAsDelivery"
          label="Billing address same as delivery address"
          checked={sameAsDelivery}
          onChange={(checked: boolean) => setSameAsDelivery(checked)}
        />
      </div>

      {/* Billing Address Section */}
      {!sameAsDelivery && (
        <div className="flex flex-wrap">
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4 text-black">
              Billing Address
            </h2>
            <hr className="my-6 border-t-2 border-gray-300" />
            <div className="rounded min-h-[112px] h-full mt-4">
              {/* Billing Address Fields */}
              <div className="mb-3">
                <label
                  htmlFor="billingAddressLine1"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  House Number and Street{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="billingAddressLine1"
                  type="text"
                  value={billingAddress.addressLine1}
                  onChange={(e) =>
                    handleAddressChange(
                      'billing',
                      'addressLine1',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                />
              </div>
              <div className="mb-3">
                <label
                  htmlFor="billingAddressLine2"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Apartment, suite, unit, etc. (Optional)
                </label>
                <input
                  id="billingAddressLine2"
                  type="text"
                  value={billingAddress.addressLine2}
                  onChange={(e) =>
                    handleAddressChange(
                      'billing',
                      'addressLine2',
                      e.target.value
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                />
              </div>
              <div className="flex space-x-4 mb-3">
                <div className="flex-1">
                  <label
                    htmlFor="billingCity"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Town/City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billingCity"
                    type="text"
                    value={billingAddress.city}
                    onChange={(e) =>
                      handleAddressChange('billing', 'city', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="billingRegion"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Region/Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billingRegion"
                    type="text"
                    value={billingAddress.region}
                    onChange={(e) =>
                      handleAddressChange('billing', 'region', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4 mb-3">
                <div className="flex-1">
                  <label
                    htmlFor="billingPostalCode"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billingPostalCode"
                    type="text"
                    value={billingAddress.postalCode}
                    onChange={(e) =>
                      handleAddressChange(
                        'billing',
                        'postalCode',
                        e.target.value.replace(/\D/g, '')
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-[#3F0071] focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="billingCountry"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="billingCountry"
                    options={countries}
                    value={
                      countries.find(
                        (country: { value: string }) =>
                          country.value === billingAddress.country
                      ) || null
                    }
                    onChange={(option) =>
                      handleCountryChange('billing', option)
                    }
                    isClearable
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;
