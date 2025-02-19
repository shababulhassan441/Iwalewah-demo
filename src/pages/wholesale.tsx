// src/pages/wholesale.tsx

import { useModalAction } from '@components/common/modal/modal.context';
import Layout from '@components/layout/layout';
import { ProductGrid } from '@components/product/product-grid';
import { ShopFilters } from '@components/search/filters';
import SearchTopBar from '@components/search/search-top-bar';
import Seo from '@components/seo/seo';
import Container from '@components/ui/container';
import Divider from '@components/ui/divider';
import { useUser } from '@contexts/user.context'; // Import the UserContext
import { fetchCategories } from '@framework/category/get-all-categories';
import { fetchWholesaleProducts } from '@framework/product/get-all-wholesale-products'; // Import the new fetch function
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { LIMITS } from '@framework/utils/limits';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { Element } from 'react-scroll';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';
import { useState, useEffect } from 'react';

function WholesalePage() {
  const router = useRouter();
  const { openModal } = useModalAction();
  const { user, loading } = useUser();
  const [wholesaleImageUrl, setWholesaleImageUrl] = useState<string>('/assets/images/404-bg.png');

  useEffect(() => {
    const fetchWholesaleImage = async () => {
      try {
        const response = await db.Generalimages.list();
        const Generalimages = response.documents[0];

        if (Generalimages && Generalimages.wholesaleImage) {
          const imageUrl = storageServices.images.getFileView(Generalimages.wholesaleImage).href;
          setWholesaleImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch wholesale image:', error);
        // Keep the default image if there's an error
      }
    };

    fetchWholesaleImage();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openModal('LOGIN_VIEW');
  };

  if (loading) {
    // Optionally, render a minimal loading state or header
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl font-semibold">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="text-center px-12 py-16 sm:py-20 lg:py-24 xl:py-32 flex items-center justify-center bg-cover bg-no-repeat bg-center min-h-screen"
        style={{
          backgroundImage: `url(${wholesaleImageUrl})`,
        }}
      >
        <div className="max-w-md xl:max-w-lg bg-white bg-opacity-80 p-8 rounded-md shadow-lg">
          <Image
            src="/assets/images/404.png"
            alt="Please Log In or Register"
            width={150}
            height={150}
          />

          <h2 className="text-4xl md:text-5xl font-bold text-brand-dark pt-5 xl:pt-9">
            Please Log In or Register
          </h2>
          <p className="text-base md:text-lg leading-7 md:leading-8 pt-4 font-medium">
            You need to be logged in to access the wholesale section. Please log in or register to continue.
          </p>
          <div className="pt-6">
            <a
              onClick={handleClick}
              className="inline-block px-6 py-3 bg-brand-dark text-white font-semibold rounded-md hover:bg-brand-dark/80 transition cursor-pointer"
            >
              Log In / Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isWholesaleApproved) {
    return (
      <div
        className="text-center px-12 py-16 sm:py-20 lg:py-24 xl:py-32 flex items-center justify-center bg-cover bg-no-repeat bg-center min-h-screen"
        style={{
          backgroundImage: `url(${wholesaleImageUrl})`,
        }}
      >
        <div className="max-w-md xl:max-w-lg bg-white bg-opacity-80 p-8 rounded-md shadow-lg">
          <Image
            src="/assets/images/404.png"
            alt="Apply for Wholesale Account"
            width={150}
            height={150}
          />

          <h2 className="text-4xl md:text-5xl font-bold text-brand-dark pt-5 xl:pt-9">
            Apply for Wholesale Account
          </h2>
          <p className="text-base md:text-lg leading-7 md:leading-8 pt-4 font-medium">
            Your account is not approved for wholesale purchases. Please apply for a wholesale account to access this section.
          </p>
          <div className="pt-6">
            <a
              href="/my-account/help-center"
              className="inline-block px-6 py-3 bg-brand-dark text-white font-semibold rounded-md hover:bg-brand-dark/80 transition"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Wholesale Products - Iwalewah"
        description="Access premium products at wholesale prices on Iwalewah. Become an approved wholesale customer and enjoy bulk buying benefits."
        path="wholesale"
      />

      <Divider />
      <Container>
        <Element name="grid" className="flex pb-16 pt-7 lg:pt-7 lg:pb-20">
          <div className="sticky hidden h-full lg:pt-4 shrink-0 ltr:pr-8 rtl:pl-8 xl:ltr:pr-16 xl:rtl:pl-16 lg:block w-80 xl:w-96 top-16">
            <ShopFilters />
          </div>
          <div className="w-full lg:pt-4 lg:ltr:-ml-4 lg:rtl:-mr-2 xl:ltr:-ml-8 xl:rtl:-mr-8 lg:-mt-1">
            <SearchTopBar />
            <ProductGrid isWholesaleProduct={true} /> {/* Ensure this prop is set to true */}
          </div>
        </Element>
      </Container>
    </>
  );
}

WholesalePage.Layout = Layout;

export default WholesalePage;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();

  // Prefetch categories
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.CATEGORIES, { limit: LIMITS.CATEGORIES_LIMITS }],
    fetchCategories
  );

  // Prefetch wholesale products
  await queryClient.prefetchInfiniteQuery(
    [API_ENDPOINTS.WHOLESALE_PRODUCTS, { limit: LIMITS.PRODUCTS_LIMITS }],
    fetchWholesaleProducts
  );

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      ...(await serverSideTranslations(locale!, [
        'common',
        'forms',
        'menu',
        'footer',
      ])),
    },
    revalidate: 60,
  };
};
