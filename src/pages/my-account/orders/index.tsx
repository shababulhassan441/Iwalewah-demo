import React, { useEffect } from 'react';
import Layout from '@components/layout/layout';
import AccountLayout from '@components/my-account/account-layout';
import OrderTable from '@components/order/order-table';
import { useOrdersQuery } from '@framework/order/get-all-orders';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Seo from '@components/seo/seo';
import { useAuth } from 'src/hooks/useAuth';

// props change to orders.

export default function OrdersTablePage() {
  const { user, loading } = useAuth(); // Get current user
  const userId = user ? user.userId : null; // Extract userId or set to null

  const { data, isLoading, error } = useOrdersQuery({}, userId);

  // Use useEffect to log userId and fetched data
  useEffect(() => {
   
  }, [userId, data]); // Only run when userId or data changes

  return (
    <span>
      <Seo
        title="Orders"
        description="Fastest E-commerce template built with React, NextJS, TypeScript, React-Query and Tailwind CSS."
        path="my-account/orders"
      />
      <AccountLayout>
        {!isLoading ? (
          <OrderTable orders={data?.data} />
        ) : (
          <div>Loading...</div>
        )}
      </AccountLayout>
    </span>
  );
}

OrdersTablePage.Layout = Layout;

export const getStaticProps = async ({ locale }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'forms',
        'menu',
        'footer',
      ])),
    },
  };
};
