// src/hooks/useDeliveryDetails.ts

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import { toast } from 'react-toastify';

interface DeliveryDetailsDocument {
  $id: string;
  maxdeliverydistance: number;
  createdAt: string;
  updatedAt: string;
}

interface UseDeliveryDetailsReturn {
  maxDeliveryDistance: number | null;
  refetchDeliveryDetails: () => void;
  loading: boolean;
  error: Error | null;
}

const useDeliveryDetails = (): UseDeliveryDetailsReturn => {
  const queryClient = useQueryClient();

  const [maxDeliveryDistance, setMaxDeliveryDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, refetch, isFetching, isError, error: queryError } = useQuery<
    DeliveryDetailsDocument[],
    Error
  >(
    ['delivery-details'],
    async () => {
      const response = await db.DeliveryDetails.list([
        Query.limit(1),
      ]);
      return response.documents.map((doc: any) => ({
        $id: doc.$id,
        maxdeliverydistance: doc.maxdeliverydistance,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));
    },
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      onError: (err: Error) => {
        console.error('Error fetching delivery details:', err);
        toast.error('Failed to fetch delivery details.');
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
      setMaxDeliveryDistance(data[0].maxdeliverydistance);
    } else {
      setMaxDeliveryDistance(null);
    }

    setLoading(isFetching);
  }, [data, isFetching, isError, queryError]);

  return {
    maxDeliveryDistance,
    refetchDeliveryDetails: refetch,
    loading,
    error,
  };
};

export default useDeliveryDetails;
