// components/auth/login-form.tsx

import React, { useState, useEffect } from 'react';
import Input from '@components/ui/form/input';
import PasswordInput from '@components/ui/form/password-input';
import Button from '@components/ui/button';
import { useForm } from 'react-hook-form';
import { initiateLogin } from 'src/appwrite/Services/authServices';
import { LoginInputType } from '@framework/types';
import Image from '@components/ui/image';
import { useModalAction } from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import cn from 'classnames';
import dynamic from 'next/dynamic';
import PurpleLogo from '@components/ui/purple-logo';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';
import { useRouter } from 'next/router';
import Link from 'next/link';


const ReCAPTCHA: any = dynamic(() => import('react-google-recaptcha') as any, { ssr: false });

interface LoginFormProps {
  isPopup?: boolean;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ isPopup = true, className }) => {
  const { closeModal, openModal } = useModalAction();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loginImageUrl, setLoginImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  // State to hold reCAPTCHA token
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  // State to track if magic link has been sent
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // State for storing user email
  const [userEmail, setUserEmail] = useState<string>('');

  const [isDemo, setIsDemo] = useState(false);




  

  useEffect(() => {
    const fetchLoginImage = async () => {
      try {
        const response = await db.Generalimages.list();
        const Generalimages = response.documents[0];

        if (Generalimages && Generalimages.loginImage) {
          const imageUrl = storageServices.images.getFileView(
            Generalimages.loginImage
          ).href;
          setLoginImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch login image:', error);
      } finally {
        setImageLoading(false);
      }
    };

    fetchLoginImage();
  }, []);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>();

  // Handle reCAPTCHA change
  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  async function onSubmit(data: LoginInputType) {
    
    // Store email before initiating login
    setUserEmail(data.email);
    
    if (!recaptchaToken) {
      setServerError('Please verify that you are not a robot.');
      return;
    }

    setServerError(null);

    try {
      // Send the reCAPTCHA token to your server for verification
      const verificationResponse = await verifyRecaptcha(recaptchaToken);

      if (verificationResponse.success) {
        if (data.email === "demo@iwalewah.com") {
          // Directly log in the demo user without sending the magic link
          await initiateLogin(data.email, data.password);
         
         // Refresh page after a small delay for stability
        setTimeout(() => {
          window.location.reload();
        }, 100);

        } else {
          // Proceed with the normal magic link flow
          await initiateLogin(data.email, data.password);
      
          // Store email before setting magic link sent
          setUserEmail(data.email);
      
          // Inform the user to check their email
          setMagicLinkSent(true);
        }
      } else {
        setServerError('reCAPTCHA verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('reCAPTCHA verification or sign-in error:', error);
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

  function handleSignUp() {
    return openModal('SIGN_UP_VIEW');
  }

  function handleForgetPassword() {
    return openModal('FORGET_PASSWORD');
  }

  function mapErrorMessage(error: any): string {
    const message = error?.message || '';
    if (message.includes('User not found'))
      return 'No account is associated with this email address.';
    if (message.includes('Invalid credentials'))
      return 'The email or password you entered is incorrect. Please try again.';
    if (message.includes('Too many requests'))
      return 'Too many login attempts. Please wait a few minutes and try again.';
    if (message.includes('Network Error'))
      return 'Network issue. Check your connection and try again.';
    return 'An unexpected error occurred. Please try again later.';
  }

  useEffect(() => {
    if (isDemo) {
      setValue("email", "demo@iwalewah.com"); // Autofill email
      setValue("password", "iwalewah@3214"); // Autofill password
    }
  }, [isDemo]); // Re-run when `isDemo` changes

  return (
    <div
      className={cn(
        'w-full md:w-[720px] lg:w-[920px] xl:w-[1000px] 2xl:w-[1200px] relative',
        className
      )}
    >
      {isPopup && <CloseButton onClick={closeModal} />}

      <div className="flex mx-auto overflow-hidden rounded-lg bg-brand-light">
        {/* Image Section */}
        <div className="md:w-1/2 lg:w-[55%] xl:w-[60%] registration hidden md:block relative">
          {loginImageUrl ? (
            <img
              src={loginImageUrl}
              alt="Sign-in Image"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          ) : (
            <Image
              src="/assets/images/login.png"
              alt="Sign-in Image"
              layout="fill"
              objectFit="cover"
            />
          )}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-primary"></div>
            </div>
          )}
        </div>
        {/* Form Section */}
        <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] py-6 sm:py-10 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-12 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <div onClick={closeModal}>
              <PurpleLogo />
            </div>
            <h4 className="text-xl font-semibold text-brand-dark sm:text-2xl sm:pt-3 ">
              Welcome Back
            </h4>
            <div className="mt-3 mb-1 text-sm text-center sm:text-15px text-body">
              Don’t have an account?{' '}
              <button
                type="button"
                className="text-sm font-semibold text-brand sm:text-15px ltr:ml-1 rtl:mr-1 hover:no-underline focus:outline-none"
                onClick={handleSignUp}
              >
                Create an account
              </button>
            </div>
              <button className=' text-[#260f47] font-semibold' onClick={() => setIsDemo(true)} >View Demo</button>
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
                  {userEmail}
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
              <div className="flex flex-col space-y-3.5">
                {serverError && (
                  <div className="mb-4 text-red-600 text-sm">{serverError}</div>
                )}
                <Input
                  label="Email"
                  type="email"
                 
                  variant="solid"
                  {...register('email', {
                    required: 'Email is required.',
                    pattern: {
                      value:
                        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: 'Please enter a valid email address.',
                    },
                  })}
                  error={errors.email?.message}
                />
                <PasswordInput
                  label="Password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required.',
                  })}
                />
                <div className="flex items-center justify-center">
                  <div className="flex ltr:ml-auto rtl:mr-auto mt-[3px]">
                    <button
                      type="button"
                      onClick={handleForgetPassword}
                      className="text-sm ltr:text-right rtl:text-left text-heading ltr:pl-3 lg:rtl:pr-3 hover:no-underline hover:text-brand-dark focus:outline-none focus:text-brand-dark"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Add reCAPTCHA here */}
                <div className="flex justify-center mt-4">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                    onChange={onRecaptchaChange}
                  />
                </div>

                <div className="relative">
                  <Button
                    type="submit"
                    loading={false}
                    disabled={false}
                    className="w-full mt-2 tracking-normal h-11 md:h-12 font-15px md:font-15px"
                    variant="formButton"
                  >
                    Sign In
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

export default LoginForm;
