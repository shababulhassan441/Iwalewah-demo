import Layout from '@components/layout/layout';
import AccountLayout from '@components/my-account/account-layout';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import PaymentBox from '@components/payment/payment-content';
import { usePaymentQuery } from '@framework/payment/payment';
import { GetStaticProps } from 'next';
import Seo from '@components/seo/seo';

export default function AccountDetailsPage() {
  let { data, isLoading } = usePaymentQuery();
  return (
    <span>
      <Seo
        title="Payment"
        description="Fastest E-commerce template built with React, NextJS, TypeScript, React-Query and Tailwind CSS."
        path="my-account/payment"
      />
      <AccountLayout>
        {!isLoading ? <PaymentBox items={data?.data} /> : <div>Loading...</div>}
      </AccountLayout>
    </span>
  );
}

AccountDetailsPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, [
        'common',
        'forms',
        'menu',
        'footer',
      ])),
    },
  };
};
