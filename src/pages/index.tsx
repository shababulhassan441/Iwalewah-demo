// pages/index.tsx

import { useState } from 'react';
import BundleGrid from '@components/bundle/bundle-grid';
import CategoryGridListBlock from '@components/common/category-grid-list-block';
import CollectionGrid from '@components/common/collection-grid';
import HeroBannerCard from '@components/hero/hero-banner-card';
import Layout from '@components/layout/layout-two';
import BestSellerGroceryProductFeed from '@components/product/feeds/best-seller-grocery-product-feed';
import PopularProductFeed from '@components/product/feeds/popular-product-feed';
import Seo from '@components/seo/seo';
import Container from '@components/ui/container';
import { fetchCategories } from '@framework/category/get-all-categories';
import { fetchBestSellerGroceryProducts } from '@framework/product/get-all-best-seller-grocery-products';
import { fetchMostOrderedProducts } from '@framework/product/get-all-popular-products';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { LIMITS } from '@framework/utils/limits';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import db from '../appwrite/Services/dbServices';
import storageServices from '../appwrite/Services/storageServices';
import HeroSliderBlock from '@components/hero/hero-slider-block';
import { homeTwoHeroBanner as heroBanner } from '@framework/static/banner';
import DeliveryAvailabilityModal from '@components/delivery-availability-modal/DeliveryAvailabilityModal';
import Link from 'next/link';

const colors = [
  '#FFEED6',
  '#D9ECD2',
  '#DBE5EF',
  '#EFD8D4',
  '#E0D6F7',
  '#F8D7DA',
];

export default function Home({ banners, heroBanners }: any) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true); // Open modal on page load

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div>
      <Seo
        title="Shop Quality Groceries Online | Fast & Fresh Delivery"
        description="Find the freshest groceries and best deals on Iwalewah. Enjoy quality products, easy online shopping, and fast delivery."
        path="/"
      />

      <HeroSliderBlock
        heroBanner={heroBanners}
        contentClassName="min-h-[400px] md:min-h-[460px] lg:min-h-[500px] xl:min-h-[550px] 2xl:min-h-[650px] py-20 py:pt-24 mb-5"
      />

      <Container>
        <BundleGrid
          data={banners}
          className="mb-6 lg:mb-14 xl:mb-16 2xl:mb-20"
        />
        <div className="mb-8 flex justify-center block md:hidden">
          <Link href="/search">
            <a className="px-6 py-3 text-white bg-brand rounded-md hover:bg-brand-dark transition duration-300">
              Start Shopping
            </a>
          </Link>
        </div>
        <CategoryGridListBlock />
        <BestSellerGroceryProductFeed />
        <PopularProductFeed />
      </Container>
      <CollectionGrid
        headingPosition="center"
        className="mb-12 pb-1 lg:pb-0 lg:mb-14 xl:mb-16 2xl:pt-4"
      />

      {/* Delivery Availability Modal */}
      {/* <DeliveryAvailabilityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <button
        onClick={handleOpenModal}
        className="hidden lg:fixed lg:bottom-4 lg:right-4 lg:bg-purple-950 lg:text-white lg:p-3 lg:rounded-full lg:shadow-lg lg:z-50 lg:block"
      >
        Check Delivery
      </button> */}
    </div>
  );
}

Home.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const queryClient = new QueryClient();

  // Prefetch Queries
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.CATEGORIES, { limit: LIMITS.CATEGORIES_LIMITS }],
    fetchCategories
  );
  await queryClient.prefetchQuery(
    [
      API_ENDPOINTS.BEST_SELLER_GROCERY_PRODUCTS,
      { limit: LIMITS.BEST_SELLER_GROCERY_PRODUCTS_LIMITS },
    ],
    fetchBestSellerGroceryProducts
  );
  await queryClient.prefetchQuery(
    [API_ENDPOINTS.POPULAR_PRODUCTS, { limit: LIMITS.POPULAR_PRODUCTS_LIMITS }],
    fetchMostOrderedProducts
  );

  // Fetch Hero Sections Data
  let heroBanners: any = [];
  try {
    const response = await db.HeroSection.list(); // Ensure the collection name matches
    const heroSectionData = response.documents;

    if (heroSectionData.length > 0) {
      heroBanners = heroSectionData.map((doc) => {
        let mobileImageUrl = '/assets/images/hero/default-banner-mobile.png';
        let desktopImageUrl = '/assets/images/hero/default-banner.png';

        if (doc.imageId) {
          mobileImageUrl = storageServices.images.getFileView(doc.imageId).href;
          desktopImageUrl = mobileImageUrl; // Adjust if different images for mobile/desktop
        }

        return {
          id: doc.$id,
          title: doc.title,
          description: doc.subtitle,
          searchBox: true,
          image: {
            mobile: { url: mobileImageUrl },
            desktop: { url: desktopImageUrl },
          },
        };
      });
    } else {
      // Fallback to default hero banner if no documents found
      heroBanners = [
        {
          id: 'default-1',
          title: 'Healthy Vegetable that you Deserve to Eat Fresh',
          description:
            'We source and sell the very best beef, lamb and pork, sourced with the greatest care from farmers.',
          searchBox: true,
          btnText: 'text-explore-more',
          btnUrl: '/search',
          image: {
            mobile: { url: '/assets/images/hero/banner-mobile-2.png' },
            desktop: { url: '/assets/images/hero/banner-2.png' },
          },
        },
      ];
    }
  } catch (error) {
    console.error('Error fetching hero sections:', error);
    // Fallback to default hero banners in case of error
    heroBanners = [
      {
        id: 'default-1',
        title: 'Healthy Vegetable that you Deserve to Eat Fresh',
        description:
          'We source and sell the very best beef, lamb and pork, sourced with the greatest care from farmers.',
        searchBox: true,
        btnText: 'text-explore-more',
        btnUrl: '/search',
        image: {
          mobile: { url: '/assets/images/hero/banner-mobile-2.png' },
          desktop: { url: '/assets/images/hero/banner-2.png' },
        },
      },
    ];
  }

  // Fetch Banners from Appwrite
  let banners: any = [];
  try {
    const bannerResponse = await db.banners.list();
    banners = bannerResponse.documents.map((banner, index) => {
      const imageUrl = storageServices.images.getFileView(banner.imageId).href;
      return {
        id: banner.$id,
        slug: banner.title.replace(/\s+/g, '-').toLowerCase(),
        image: imageUrl,
        title: banner.title,
        description: banner.subtitle,
        bgColor: colors[index % colors.length],
      };
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
  }

  return {
    props: {
      banners,
      heroBanners, // Updated to an array
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
