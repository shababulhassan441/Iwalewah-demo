// src/hooks/useUserVouchers.ts

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import { toast } from 'react-toastify';

// Interface for User Voucher document
interface UserVoucherDocument {
  $id: string;
  userId: string;
  voucherId: string;
  isUsed: boolean;
  usedAt: string;
  orderId: string;
}

// Interface for hook return type
interface UseUserVouchersReturn {
  hasUsed: boolean;
  refetchUserVouchers: () => void;
  loading: boolean;
  error: Error | null;
}

// Hook to check if the user has already used the voucher
const useUserVouchers = (userId: string, voucherId: string): UseUserVouchersReturn => {
  const queryClient = useQueryClient();

  const [hasUsed, setHasUsed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, refetch, isFetching, isError, error: queryError } = useQuery<
    UserVoucherDocument[],
    Error
  >(
    ['user-vouchers', userId, voucherId],
    async () => {
      const response = await db.UserVouchers.list([
        Query.equal('userId', userId),
        Query.equal('voucherId', voucherId),
        Query.equal('isUsed', true),
      ]);
      return response.documents.map((doc: any) => ({
        $id: doc.$id,
        userId: doc.userId,
        voucherId: doc.voucherId,
        isUsed: doc.isUsed,
        usedAt: doc.usedAt,
        orderId: doc.orderId,
      }));
    },
    {
      enabled: !!userId && !!voucherId, // Only fetch if userId and voucherId are provided
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      onError: (err: Error) => {
        console.error('Error fetching user vouchers:', err);
        toast.error('Failed to fetch user vouchers.');
      },
    }
  );

  useEffect(() => {
    if (isError && queryError) {
      setError(queryError);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setHasUsed(true);
    } else {
      setHasUsed(false);
    }

    setLoading(isFetching);
  }, [data, isFetching, isError, queryError]);

  return {
    hasUsed,
    refetchUserVouchers: refetch,
    loading,
    error,
  };
};

export default useUserVouchers;
