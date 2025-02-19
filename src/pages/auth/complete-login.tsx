// pages/auth/complete-login.tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { completeLogin } from 'src/appwrite/Services/authServices';
import VerificationStatus from '@components/auth/verification-status';

const CompleteLogin = () => {
  const router = useRouter();
  const { userId, secret } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Completing your login...');

  useEffect(() => {
    const finishLogin = async () => {
      if (userId && secret) {
        try {
          await completeLogin(userId as string, secret as string);
          setStatus('success');
          setMessage('Login successful! Redirecting to your account...');
          setTimeout(() => {
            router.push('/my-account/account-settings');
          }, 2000);
        } catch (err) {
          console.error('Login completion error:', err);
          setStatus('error');
          setMessage('Failed to complete login. Please try again or contact support.');
        }
      }
    };

    finishLogin();
  }, [userId, secret]);

  return <VerificationStatus status={status} message={message} />;
};

export default CompleteLogin;
