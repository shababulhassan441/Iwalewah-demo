// components/my-account/change-password.tsx

import PasswordInput from '@components/ui/form/password-input';
import Button from '@components/ui/button';
import Heading from '@components/ui/heading';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { getCurrentUser, updatePassword } from 'src/appwrite/Services/authServices';

const defaultValues = {
  oldPassword: '',
  newPassword: '',
};

const ChangePassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    defaultValues,
  });

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Verify if the user is authenticated on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setMessage('User is not authenticated. Please log in.');
      }
    };
    verifyAuth();
  }, []);

  async function onSubmit(input: any) {
    setMessage(null); // Reset message on new submit
    setIsLoading(true);

    try {
      await updatePassword(input.oldPassword, input.newPassword);
      setIsSuccess(true);
      setMessage('Your password has been successfully changed.');
      reset();
    } catch (err: any) {
      setIsSuccess(false);
      // Extract a user-friendly error message from the Appwrite error
      let errorMessage = 'Failed to change password. Please try again.';
      if (err?.message) {
        errorMessage = err.message;
      }
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Heading variant="titleLarge">
        Change Password
      </Heading>
      <div className="w-full flex h-full lg:w-10/12 2xl:w-9/12 flex-col mt-6 lg:mt-7">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full mx-auto flex flex-col justify-center"
        >
          <div className="flex flex-col space-y-5 lg:space-y-7">
            <PasswordInput
              label="Current Password"
              error={errors.oldPassword?.message?.toString()}
              {...register('oldPassword', {
                required: 'Please enter your current password.',
              })}
            />
            <PasswordInput
              label="New Password"
              error={errors.newPassword?.message?.toString()}
              {...register('newPassword', {
                required: 'Please enter a new password.',
                minLength: {
                  value: 6,
                  message: 'New password must be at least 6 characters long.',
                },
              })}
            />
            {message && (
              <div
                className={`mt-2 text-sm ${
                  isSuccess ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message}
              </div>
            )}
            <div className="relative mt-3">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                variant="formButton"
                className="w-full sm:w-auto"
              >
                Change Password
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
