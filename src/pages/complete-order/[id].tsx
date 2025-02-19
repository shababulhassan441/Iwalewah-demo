// pages/complete-order/[id].tsx

import Container from '@components/ui/container';
import Layout from '@components/layout/layout';
import OrderInformation from '@components/order/order-information';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps, GetStaticPaths } from 'next';
import Divider from '@components/ui/divider';
import { useEffect } from 'react';
import { useCart } from '@contexts/cart/cart.context';
import Seo from '@components/seo/seo';
import { useRouter } from 'next/router';

interface CompleteOrderPageProps {
  // Add any additional props if needed
}

export default function Order({}: CompleteOrderPageProps) {
  const { resetCart } = useCart();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    resetCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Seo
        title="Order Complete - Iwalewah"
        description="Thank you for your order! Your purchase has been successfully completed. Check your order status or continue shopping for more quality products on Iwalewah."
        path="complete-order"
      />

      <Divider />
      <Container>
        {/* Ensure that 'id' is passed as a string or handle undefined */}
        {typeof id === 'string' ? (
          <OrderInformation orderId={id} />
        ) : (
          <p className="text-center">{/* Optionally, add a loading state */}</p>
        )}
      </Container>
      <Divider />
    </>
  );
}

Order.Layout = Layout;

// Define getStaticPaths with fallback: 'blocking'
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // No pre-rendered paths
    fallback: 'blocking', // Generate pages on-demand
  };
};

// Define getStaticProps to handle translations
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', [
        'common',
        'forms',
        'menu',
        'footer',
      ])),
    },
  };
};
