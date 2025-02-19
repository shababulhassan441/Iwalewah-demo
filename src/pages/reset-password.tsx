// pages/reset-password.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useModalAction } from '@components/common/modal/modal.context';
import { NextPage } from 'next';

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const { openModal } = useModalAction();
  const { userId, secret } = router.query;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      if (secret && userId) {
        // Open the reset password modal with secret and userId
        openModal('RESET_PASSWORD', { secret, userId });
        setIsLoading(false);
      } else if (!secret || !userId) {
        // Redirect if params are missing
        router.push('/login');
      }
    }
  }, [router.isReady, secret, userId, openModal, router]);

  if (isLoading) return <div>Loading...</div>; // Optional loading state

  return null; // Modal handles the reset password form
};

export default ResetPasswordPage;
