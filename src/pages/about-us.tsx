// src/pages/about-us.tsx

// import Layout from '@components/layout/layout';
import Layout from '@components/layout/layout-two';
import Seo from '@components/seo/seo';
import Container from '@components/ui/container';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import db from 'src/appwrite/Services/dbServices'; // Import dbservices
import { Models, Query } from 'appwrite';
import { Collection } from 'src/appwrite/collections'; // Ensure correct import path

interface AboutUsProps {
  title: string;
  description: string;
}

const backgroundThumbnail = '/assets/images/about-us.jpg';

function TermsPage({ title, description } : any)  {
  const { t } = useTranslation('about');
  return (
    <span>
      <Seo
        title="About Iwalewah - Our Story, Vision & Values"
        description="Learn more about Iwalewah, your trusted e-commerce platform. Discover our mission, vision, and the values that drive us to provide quality products and exceptional service."
        path="about-us"
      />
      {/* End of seo */}
      <div
        className="flex justify-center h-[250px] lg:h-96 2xl:h-[500px] w-full bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url(${backgroundThumbnail})`,
        }}
      ></div>
      <div className="py-8 lg:py-16 2xl:py-20">
        <Container>
          <div className="flex flex-col w-full mx-auto max-w-[1200px]">
            <h2 className="text-lg md:text-xl lg:text-[24px] text-brand-dark font-semibold mb-4 lg:mb-7">
              {title}
            </h2>
            <div
              className="text-sm leading-7 text-brand-dark opacity-70 lg:text-15px lg:leading-loose"
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />
          </div>
        </Container>
      </div>
    </span>
  );
};

TermsPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // Fetch documents from the AboutUs collection
    // Assuming you have a 'locale' field in your AboutUs documents
    const aboutUsDocuments = await db.AboutUs.list();

    let title = 'About Us'; // Default title
    let description = '<p>Default description for About Us.</p>'; // Default description

    if (aboutUsDocuments.documents.length > 0) {
      const aboutUsData = aboutUsDocuments.documents[0] as Models.Document;
      title = aboutUsData.title || title;
      description = aboutUsData.description || description;
    } else {
      console.warn(`No AboutUs document found for locale: ${locale}`);
    }

    return {
      props: {
        title,
        description,
        ...(await serverSideTranslations(locale!, [
          'common',
          'forms',
          'menu',
          'about',
          'footer',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds (optional)
    };
  } catch (error) {
    console.error('Error fetching AboutUs data:', error);
    return {
      props: {
        title: 'About Us',
        description: '<p>Default description for About Us.</p>',
        ...(await serverSideTranslations(locale!, [
          'common',
          'forms',
          'menu',
          'about',
          'footer',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds (optional)
    };
  }
};

export default TermsPage;
