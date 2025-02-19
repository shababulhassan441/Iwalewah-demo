// src/hooks/useVoucher.ts

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import { toast } from 'react-toastify';

// Interface for the Voucher document
interface VoucherDocument {
  $id: string;
  code: string;
  discountValue: number;
  expiryDate: string; // New field for expiry date
  createdAt: string;
  updatedAt: string;
}

// Interface for hook return type
interface UseVoucherReturn {
  voucher: VoucherDocument | null;
  refetchVoucher: () => void;
  loading: boolean;
  error: Error | null;
}

// Hook to fetch voucher by code
const useVoucher = (code: string): UseVoucherReturn => {
  const queryClient = useQueryClient();

  const [voucher, setVoucher] = useState<VoucherDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, refetch, isFetching, isError, error: queryError } = useQuery<
    VoucherDocument[],
    Error
  >(
    ['voucher', code],
    async () => {
      const response = await db.Vouchers.list([
        Query.equal('code', code),
        Query.limit(1), // Assume unique codes
      ]);
      return response.documents.map((doc: any) => ({
        $id: doc.$id,
        code: doc.code,
        discountValue: doc.discountValue,
        expiryDate: doc.expiryDate, // Fetch expiry date
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));
    },
    {
      enabled: !!code, // Only fetch if code is provided
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      onError: (err: Error) => {
        console.error('Error fetching voucher:', err);
        toast.error('Failed to fetch voucher.');
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
      setVoucher(data[0]);
    } else {
      setVoucher(null);
    }

    setLoading(isFetching);
  }, [data, isFetching, isError, queryError]);

  return {
    voucher,
    refetchVoucher: refetch,
    loading,
    error,
  };
};

export default useVoucher;
