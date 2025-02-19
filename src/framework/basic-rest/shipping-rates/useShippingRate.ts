// src/hooks/useShippingRate.ts

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import { toast } from 'react-toastify';

interface ShippingRateDocument {
  $id: string;
  shippingRate: number;
  FreeDeliveryThreshold: number;
  createdAt: string;
  updatedAt: string;
}

interface UseShippingRateReturn {
  shippingRate: number | null;
  FreeDeliveryThreshold: number | null;
  refetchShippingRate: () => void;
  loading: boolean;
  error: Error | null;
}

const useShippingRate = (): UseShippingRateReturn => {
  const queryClient = useQueryClient();

  const [shippingRate, setShippingRate] = useState<number | null>(null);
  const [FreeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number | null>(null); // New state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const { data, refetch, isFetching, isError, error: queryError } = useQuery<
    ShippingRateDocument[],
    Error
  >(
    ['shipping-rate'],
    async () => {
      const response = await db.ShippingRates.list([
        Query.limit(1),
      ]);
      return response.documents.map((doc: any) => ({
        $id: doc.$id,
        shippingRate: doc.shippingRate,
        FreeDeliveryThreshold: doc.FreeDeliveryThreshold,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));
    },
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      onError: (err: Error) => {
        console.error('Error fetching shipping rate:', err);
        toast.error('Failed to fetch shipping rate.');
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
      setShippingRate(data[0].shippingRate);
      setFreeDeliveryThreshold(data[0].FreeDeliveryThreshold); // Set FreeDeliveryThreshold from data
    } else {
      setShippingRate(null);
      setFreeDeliveryThreshold(null); // Set to null if no data
    }

    setLoading(isFetching);
  }, [data, isFetching, isError, queryError]);

  return {
    shippingRate,
    FreeDeliveryThreshold, // Include in return
    refetchShippingRate: refetch,
    loading,
    error,
  };
};

export default useShippingRate;
