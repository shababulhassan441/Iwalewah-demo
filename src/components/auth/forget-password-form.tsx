import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/button';
import Input from '@components/ui/form/input';
import { sendRecoveryEmail } from 'src/appwrite/Services/authServices';
import { useModalAction } from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import PurpleLogo from '@components/ui/purple-logo';
import db from 'src/appwrite/Services/dbServices'; // Import DB services
import { Query } from 'appwrite'; // Import Query

type FormValues = {
  email: string;
};

const defaultValues = {
  email: '',
};

const ForgetPasswordForm = () => {
  const { closeModal, openModal } = useModalAction();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null); // State for success message

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
  });

  function handleSignIn() {
    return openModal('LOGIN_VIEW');
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setServerSuccess(null);
    try {
      // Check if the email exists in the Users collection
      const users = await db.Users.list([Query.equal('email', values.email)]);
      
      if (users.documents.length === 0) {
        // If no user found with this email
        setServerError('User not found');
        return;
      }

      // If user found, send recovery email
      await sendRecoveryEmail(values.email);
      setServerSuccess('Password reset email sent');
    } catch (error: any) {
      // Extract error message
      const message = error?.response?.data?.message || error.message || 'Error sending email';
      setServerError(message);
    }
  };

  return (
    <div className="w-full px-5 py-6 mx-auto rounded-lg sm:p-8 bg-brand-light sm:w-96 md:w-450px">
      <CloseButton onClick={closeModal} />
      <div className="text-center mb-9 pt-2.5">
        <div onClick={closeModal}>
          <PurpleLogo />
        </div>
        <p className="mt-3 mb-8 text-sm md:text-base text-body sm:mt-4 sm:mb-10">
          Please enter your email address to reset your password.
        </p>
      </div>
      <form
        onSubmit={handleSubmit((data) => onSubmit(data))}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-4">
          {serverError && (
            <div className="mb-4 text-red-600 text-sm">
              {serverError}
            </div>
          )}
          {serverSuccess && (
            <div className="mb-4 text-green-600 text-sm">
              {serverSuccess}
            </div>
          )}
          <Input
            label="Email Address"
            type="email"
            variant="solid"
            className="mb-4"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value:
                  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />

          <Button
            type="submit"
            variant="formButton"
            className="w-full mt-0 h-11 md:h-12"
          >
            Reset Password
          </Button>
        </div>
      </form>
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-10 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 px-2 bg-brand-light">
          Or
        </span>
      </div>
      <div className="text-sm text-center sm:text-15px text-brand-muted">
        Back to{' '}
        <button
          type="button"
          className="font-medium underline text-brand-dark hover:no-underline focus:outline-none"
          onClick={handleSignIn}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default ForgetPasswordForm;
