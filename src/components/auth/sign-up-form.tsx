// components/auth/sign-up-form.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import Input from '@components/ui/form/input';
import PasswordInput from '@components/ui/form/password-input';
import Button from '@components/ui/button';
import { registerUser } from 'src/appwrite/Services/authServices';
import { SignUpInputType } from '@framework/types';
import { useModalAction } from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import cn from 'classnames';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import PurpleLogo from '@components/ui/purple-logo';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';
import Select, { StylesConfig, components } from 'react-select'; // Import react-select and components
import { allCountries } from 'country-telephone-data'; // Import allCountries from country-telephone-data
import { debounce } from 'lodash';
const Flag: any = dynamic(() => import('react-world-flags') as any, { ssr: false });


const ReCAPTCHA: any = dynamic(() => import('react-google-recaptcha') as any, { ssr: false });

interface SignUpFormProps {
  isPopup?: boolean;
  className?: string;
}

interface CountryOption {
  label: string;
  value: string;
  flag: string; // Add flag property
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  isPopup = true,
  className,
}) => {
  const { closeModal, openModal } = useModalAction();
  const [serverError, setServerError] = useState<string | null>(null);
  const [signUpImageUrl, setSignUpImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // State to hold reCAPTCHA token
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // State to track if magic link has been sent
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // State to store the user's email after form submission
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  // **Updated useForm Hook**
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting }, // Destructure isValid and isSubmitting
  } = useForm<SignUpInputType>({
    mode: 'onChange', // Enable real-time validation
  });

  // Define tempPhoneNumber and handleTempPhoneChange
  const [tempPhoneNumber, setTempPhoneNumber] = useState<string>('');
  const handleTempPhoneChange = (value: string) => {
    setTempPhoneNumber(value.replace(/[^0-9+ ()-]/g, '')); // Allow only valid characters
    clearErrors('telephone'); // Clear telephone errors on input change
  };

  useEffect(() => {
    const fetchSignUpImage = async () => {
      try {
        const response = await db.Generalimages.list();
        const Generalimages = response.documents[0];

        if (Generalimages && Generalimages.loginImage) {
          const imageUrl = storageServices.images.getFileView(
            Generalimages.loginImage
          ).href;
          setSignUpImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch sign-up image:', error);
      } finally {
        setImageLoading(false);
      }
    };

    fetchSignUpImage();
  }, []);

  // Fetching all countries and their dial codes using country-telephone-data
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  useEffect(() => {
    const formattedCountries = allCountries.map((country) => ({
      label: `+${country.dialCode}`, // Dial code with "+"
      value: country.iso2.toLowerCase(),
      flag: country.iso2.toLowerCase(), // ISO2 code for flag
    }));
    setCountryOptions(formattedCountries);
  }, []);

  // Handler for reCAPTCHA change
  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    clearErrors('recaptcha'); // **Clear reCAPTCHA errors on successful change**
  };

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
  //           clearErrors('telephone'); // Clear telephone errors if valid
  //         } else if (result.error) {
  //           setError('telephone', {
  //             type: 'server',
  //             message: result.error,
  //           });
  //         } else {
  //           setError('telephone', {
  //             type: 'server',
  //             message: 'Invalid phone number or does not exist.',
  //           });
  //         }
  //       } catch (error: any) {
  //         setError('telephone', {
  //           type: 'server',
  //           message: `Error validating phone number: ${error.message}`,
  //         });
  //       }
  //     } else {
  //       clearErrors('telephone'); // Clear telephone errors if empty
  //     }
  //   }, 500),
  //   [clearErrors, setError]
  // );

  const validatePhone = useCallback(
    debounce(async (_phone: string, _countryCode: string) => {
      return; // Skip validation
    }, 500),
    []
  );
  

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
  //           clearErrors('email'); // Clear email errors if valid
  //         } else if (result.error) {
  //           setError('email', {
  //             type: 'server',
  //             message: result.error,
  //           });
  //         } else {
  //           setError('email', {
  //             type: 'server',
  //             message: 'Invalid email address or does not exist.',
  //           });
  //         }
  //       } catch (error: any) {
  //         setError('email', {
  //           type: 'server',
  //           message: `Error validating email address: ${error.message}`,
  //         });
  //       }
  //     } else {
  //       clearErrors('email'); // Clear email errors if empty
  //     }
  //   }, 500),
  //   [clearErrors, setError]
  // );

  async function onSubmit(input: SignUpInputType) {
    if (!recaptchaToken) {
      setServerError('Please verify that you are not a robot.');
      return;
    }

    setServerError(null);

    try {
      const verificationResponse = await verifyRecaptcha(recaptchaToken);

      if (verificationResponse.success) {
        // Find the selected country to get the dial code
        const selectedCountry = allCountries.find(
          (country) => country.iso2.toLowerCase() === input.countryCode
        );

        const dialCode = selectedCountry ? selectedCountry.dialCode : '';

        // Combine dial code and phone number
        const completePhoneNumber = `+${dialCode}${input.telephone.replace(
          /\D/g,
          ''
        )}`;

        // Proceed with sign-up
        await registerUser({
          name: input.name,
          email: input.email,
          password: input.password,
          telephone: completePhoneNumber,
        });

        // Store the user's email for the success message
        setSentEmail(input.email);

        // Store the user's email for the success message
        setSentEmail(input.email);

        // setMagicLinkSent(true);
      } else {
        setServerError('reCAPTCHA verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('reCAPTCHA verification or sign-up error:', error);
      // Handle specific errors
      const errorMessage = mapErrorMessage(error);
      setServerError(errorMessage);
    }
  }

  // Function to verify reCAPTCHA token with your server
  const verifyRecaptcha = async (token: string) => {
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response.json();
  };

  function handleSignIn() {
    return openModal('LOGIN_VIEW');
  }

  // Function to map error messages for better user experience
  function mapErrorMessage(error: any): string {
    const message = error?.message || '';
    if (
      message.includes(
        'A user with the same id, email, or phone already exists in this project'
      )
    )
      return 'An account with this email already exists.';
    if (message.includes('Invalid data'))
      return 'Invalid data provided. Please check your inputs.';
    if (message.includes('Network Error'))
      return 'Network issue. Check your connection and try again.';
    return 'An unexpected error occurred. Please try again later.';
  }

  // Minimal custom styles for react-select to set text color to black and adjust dropdown
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
      minWidth: '25px', // Reduce the container width for the indicator
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px', // Increase the max height of the dropdown
      overflowY: 'auto', // Enable vertical scrolling
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure the dropdown appears above other elements
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

  return (
    <div
      className={cn(
        'flex bg-brand-light mx-auto rounded-lg md:w-[720px] lg:w-[920px] xl:w-[1000px] 2xl:w-[1200px] relative',
        className
      )}
    >
      {isPopup && <CloseButton onClick={closeModal} />}
      <div className="flex w-full mx-auto overflow-hidden rounded-lg bg-brand-light">
        {/* Image Section */}
        <div className="md:w-1/2 lg:w-[55%] xl:w-[60%] registration hidden md:block relative">
          {signUpImageUrl ? (
            <img
              src={signUpImageUrl}
              alt="Sign-up Image"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          ) : (
            <Image
              src="/assets/images/login.png"
              alt="Sign-up Image"
              layout="fill"
              objectFit="cover"
            />
          )}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              {/* Spinner animation */}
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
            </div>
          )}
        </div>
        {/* Form Section */}
        <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] py-6 sm:py-10 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-12 rounded-md shadow-dropDown flex flex-col justify-center">
          <div className="text-center mb-6 pt-2.5">
            <div onClick={closeModal}>
              <PurpleLogo />
            </div>
            <h4 className="text-xl font-semibold text-brand-dark sm:text-2xl sm:pt-3 ">
              Sign Up
            </h4>
            <div className="mt-3 mb-1 text-sm text-center sm:text-base text-body">
              Already have an account?
              <button
                type="button"
                className="text-sm font-semibold ltr:ml-1 rtl:mr-1 sm:text-base text-brand hover:no-underline focus:outline-none"
                onClick={handleSignIn}
              >
                Sign in now
              </button>
            </div>
          </div>
          {magicLinkSent ? (
            <div className="flex flex-col items-center justify-center w-full px-4 py-8 text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-brand-primary mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-brand-dark mb-4">
                Check your email
              </h2>

              {/* Message */}
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-600">
                  To securely access your account, we've emailed a sign-in link
                  to
                </p>
                <p className="font-medium text-brand-dark text-lg">
                  {sentEmail}
                </p>
                <p className="text-gray-600">
                  Please check your inbox – the link is valid for the next 15
                  minutes.
                </p>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">
                      Didn't receive the email?
                    </span>
                  </div>
                </div>

                {/* Help text and link */}
                <p className="text-gray-500 mb-6">
                  Be sure to check your spam or junk folder.
                </p>

                <a
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-brand hover:bg-brand-dark transition-colors duration-200 rounded-md shadow-sm"
                >
                  Return to Login Page
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col justify-center"
              noValidate
            >
              <div className="flex flex-col space-y-4">
                {/* Display serverError if it's a general error */}
                {serverError && !errors.email && !errors.telephone && (
                  <div className="mb-4 text-red-600 text-sm">{serverError}</div>
                )}
                <Input
                  label="Name"
                  type="text"
                  variant="solid"
                  {...register('name', {
                    required: 'Name is required.',
                  })}
                  error={errors.name?.message}
                />
                {/* Email Input Field using Controller */}
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      label="Email"
                      type="email"
                      variant="solid"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        validateEmail(e.target.value); // Trigger email validation on change
                      }}
                      error={errors.email?.message}
                    />
                  )}
                />
                <PasswordInput
                  label="Password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required.',
                  })}
                />
                {/* Telephone Input Field with Country Code Selector */}
                <div className="flex flex-col">
                  <label
                    htmlFor="telephone"
                    className="block mb-1 font-semibold text-gray-700"
                  >
                    Telephone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    {/* Country Code Selector using react-select and Controller */}
                    <div className="w-44 mr-2">
                      {' '}
                      {/* Increased width from w-36 to w-44 */}
                      <Controller
                        name="countryCode"
                        control={control}
                        defaultValue="gb" // Default to United Kingdom
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={countryOptions}
                            value={countryOptions.find(
                              (option) => option.value === field.value
                            )}
                            onChange={(selectedOption) => {
                              field.onChange(selectedOption?.value);
                              // Optionally, trigger phone validation when country changes
                              if (selectedOption && tempPhoneNumber) {
                                validatePhone(
                                  tempPhoneNumber,
                                  selectedOption.value
                                );
                              }
                            }}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isSearchable
                            styles={customSelectStyles} // Apply minimal custom styles
                            components={{ DropdownIndicator }} // Use custom DropdownIndicator
                            formatOptionLabel={(e) => (
                              <div className="flex items-center">
                                <Flag code={e.flag} className="w-5 h-5 mr-2" />{' '}
                                {/* Display the flag */}
                                <span>{e.label}</span>{' '}
                                {/* Display country code */}
                              </div>
                            )}
                            menuPortalTarget={
                              typeof window !== 'undefined'
                                ? document.body
                                : undefined
                            } // Render menu in portal
                            menuPosition="fixed" // Position the menu relative to the viewport
                          />
                        )}
                      />
                    </div>
                    {/* Phone Number Input */}
                    <input
                      type="tel"
                      id="telephone"
                      {...register('telephone', {
                        required: 'Telephone is required.',
                        pattern: {
                          value: /^\+?[1-9]\d{1,14}$/, // E.164 format
                          message: 'Please enter a valid telephone number.',
                        },
                        onChange: (e) => {
                          handleTempPhoneChange(e.target.value);
                          const countryCode = getValues('countryCode') || 'gb';
                          validatePhone(e.target.value, countryCode);
                        },
                      })}
                      value={tempPhoneNumber}
                      onChange={(e) => {
                        handleTempPhoneChange(e.target.value);
                        const countryCode = getValues('countryCode') || 'gb';
                        validatePhone(e.target.value, countryCode);
                      }}
                      className={`p-2 border border-gray-300 rounded-r w-full text-black focus:outline-none focus:ring-1 focus:ring-[#3F0071] focus:border-transparent ${
                        errors.telephone ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
                {/* Add reCAPTCHA here */}
                <div className="flex justify-center mt-4">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={onRecaptchaChange}
                  />
                </div>
                {/* Display reCAPTCHA Error */}
                {errors.recaptcha && (
                  <div className="mb-4 text-red-600 text-sm">
                    {errors.recaptcha.message}
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <div
                    className="flex ltr:ml-auto rtl:mr-auto mt-[2px]"
                    onClick={closeModal}
                  >
                    <a
                      href="/privacy"
                      className="text-sm ltr:text-right rtl:text-left text-heading ltr:pl-3 lg:rtl:pr-3 hover:no-underline hover:text-brand-dark focus:outline-none focus:text-brand-dark"
                    >
                      Privacy Policy
                    </a>
                  </div>
                </div>
                <div className="relative">
                  {/* **Updated Register Button** */}
                  <Button
                    type="submit"
                    loading={isSubmitting} // Show loading state during submission
                    disabled={!isValid || isSubmitting} // Disable when form is invalid or submitting
                    className="w-full mt-2 tracking-normal h-11 md:h-12 font-15px md:font-15px"
                    variant="formButton"
                  >
                    Register
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
