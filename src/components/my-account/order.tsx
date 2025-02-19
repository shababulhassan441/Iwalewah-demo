// src/pages/orders.tsx

import Layout from '@components/layout/layout';
import OrderTable from '@components/order/order-table';
import { useOrdersQuery } from '@framework/order/get-all-orders';
import { useEffect } from 'react';
import { useAuth } from 'src/hooks/useAuth';

export default function OrdersTablePage() {
  const { user, loading } = useAuth(); // Get current user
  const userId = user ? user.userId : null; // Extract userId or set to null

  const { data, isLoading, error } = useOrdersQuery({}, userId);

  // Use useEffect to log userId and fetched data
  // useEffect(() => {
  //   console.log('User ID:', userId); // Log the userId

  //   console.log('Fetched Orders Data:', data); // Log the fetched data
  // }, [userId, data]); // Only run when userId or data changes

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-4">
      {!isLoading && !error ? (
        <OrderTable orders={data?.data} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

OrdersTablePage.Layout = Layout;
