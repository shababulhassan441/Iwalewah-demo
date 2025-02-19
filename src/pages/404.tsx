import Layout from '@components/layout/layout';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ErrorInformation from '@components/404/error-information';
import Seo from '@components/seo/seo';

export default function ErrorPage() {
  return (
    <span>
      <Seo
        title="Page Not Found - Iwalewah"
        description="The page you are looking for could not be found. Explore other categories or return to the homepage for more options on Iwalewah."
        path="404"
      />
      <ErrorInformation />
    </span>
  );
}

ErrorPage.Layout = Layout;

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
