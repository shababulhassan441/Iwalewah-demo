// pages/verify-email.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { completeEmailVerification } from 'src/appwrite/Services/authServices';
import VerificationStatus from '@components/auth/verification-status';

const VerifyEmail = () => {
  const router = useRouter();
  const { userId, secret } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      if (userId && secret) {
        try {
          await completeEmailVerification(userId as string, secret as string);
          setStatus('success');
          setMessage('Email verified successfully! Redirecting...');
          setTimeout(() => {
            router.push('/my-account/account-settings');
          }, 2000);
        } catch (err) {
          console.error('Email verification error:', err);
          setStatus('error');
          setMessage('Failed to verify email. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [userId, secret]);

  return <VerificationStatus status={status} message={message} />;
};

export default VerifyEmail;
