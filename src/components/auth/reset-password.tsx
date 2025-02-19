// components/auth/reset-password-form.tsx

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '@components/ui/button';
import Input from '@components/ui/form/input';
import { account } from 'src/appwrite/config'; // Direct import for Appwrite Account
import CloseButton from '@components/ui/close-button';
import PurpleLogo from '@components/ui/purple-logo';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

type FormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3); // Countdown state

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    // Retrieve `userId` and `secret` from query parameters
    if (router.isReady) {
      const queryUserId = router.query.userId as string;
      const querySecret = router.query.secret as string;

      if (queryUserId && querySecret) {
        setUserId(queryUserId);
        setSecret(querySecret);
      } else {
        setServerError("Invalid or missing password reset parameters.");
      }
    }
  }, [router.isReady, router.query.userId, router.query.secret]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (serverSuccess && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0 && serverSuccess) {
      router.replace('/');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [serverSuccess, countdown, router]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setServerSuccess(null);
    setIsLoading(true);

    if (values.password !== values.confirmPassword) {
      setServerError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (userId && secret) {
      try {
        await account.updateRecovery(userId, secret, values.password);
        setServerSuccess("Your password has been successfully reset. Redirecting to homepage...");
        toast.success("Your password has been successfully reset.");

        // Start countdown
        setCountdown(3);
      } catch (error: any) {
        const message = error.message || "Error resetting password. Please try again.";
        setServerError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setServerError("Unable to reset password. Please check your link or try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-5 py-6 mx-auto rounded-lg sm:p-8 bg-brand-light sm:w-96 md:w-450px">
      <CloseButton onClick={() => router.push('/login')} />
      <div className="text-center mb-9 pt-2.5">
        <PurpleLogo />
        <h2 className="mt-3 mb-8 text-xl font-semibold text-brand-dark sm:text-2xl sm:mt-4 sm:mb-10">
          Reset Your Password
        </h2>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center"
        noValidate
      >
        <div className="flex flex-col space-y-4">
          {serverError && <div className="mb-4 text-red-600 text-sm">{serverError}</div>}
          {serverSuccess && (
            <div className="mb-4 text-green-600 text-sm">
              {serverSuccess}
              {countdown > 0 && ` (${countdown})`}
            </div>
          )}
          <Input
            label="New Password"
            type="password"
            variant="solid"
            className="mb-4"
            {...register('password', {
              required: "New password is required.",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters.",
              },
            })}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            variant="solid"
            className="mb-4"
            {...register('confirmPassword', {
              required: "Please confirm your password.",
              validate: (value) =>
                value === password || "Passwords do not match.",
            })}
            error={errors.confirmPassword?.message}
          />
          <div className="relative">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || !!serverSuccess}
              className="w-full mt-0 h-11 md:h-12"
              variant="formButton"
            >
              {serverSuccess ? `Redirecting in ${countdown}...` : "Reset Password"}
            </Button>
          </div>
        </div>
      </form>
      <div className="relative flex flex-col items-center justify-center mt-8 mb-6 text-sm text-heading sm:mt-10 sm:mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 px-2 bg-brand-light">or</span>
      </div>
      <div className="text-sm text-center sm:text-15px text-brand-muted">
        Back to{' '}
        <button
          type="button"
          className="font-medium underline text-brand-dark hover:no-underline focus:outline-none"
          onClick={() => router.push('/')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
