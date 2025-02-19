// src/pages/blogs/[id].tsx

import { GetStaticPaths, GetStaticProps } from 'next';
import Layout from '@components/layout/layout';
import Seo from '@components/seo/seo';
import Container from '@components/ui/container';
import db from 'src/appwrite/Services/dbServices'; // Import dbServices
import storageServices from 'src/appwrite/Services/storageServices'; // Import storageServices
import { Models } from 'appwrite';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

interface BlogDetailsProps {
  title: string;
  content: string;
  imageUrl: string;
}

const BlogDetailsPage = ({ title, content, imageUrl }: BlogDetailsProps) => {
  const { t } = useTranslation('blog');

  return (
    <>
      <Seo
        title={title}
        description={content?.slice(0, 160)} // For SEO, slicing the content to fit description
        path="blogs"
      />
      {/* 
        Removed the outer padding container to allow the image to take full width.
        Adjusted the image container to occupy a larger height.
        Removed bg-no-contain to prevent conflicting styles.
        Added responsive height classes for better responsiveness.
      */}
      {/* <div className="px-4 sm:px-6 lg:px-14"> */}
      <div
        className="w-full h-[120vh] sm:h-[130vh] lg:h-[120vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
        aria-label={t(title)}
        role="img"
      ></div>
      {/* </div> */}
      <div className="py-8 lg:py-16 2xl:py-20">
        <Container>
          <div className="flex flex-col w-full mx-auto max-w-[1200px]">
            <h2 className="text-lg md:text-xl lg:text-[24px] text-brand-dark font-semibold mb-4 lg:mb-7">
              {title}
            </h2>
            <div
              className="text-sm leading-7 text-brand-dark opacity-70 lg:text-15px lg:leading-loose"
              dangerouslySetInnerHTML={{
                __html: content, // Rendering the HTML content
              }}
            />
          </div>
        </Container>
      </div>
    </>
  );
};

BlogDetailsPage.Layout = Layout;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    // Fetch all blog documents to generate paths
    const response = await db.blogs.list();
    const blogs = response.documents;

    const paths = blogs.map((blog: Models.Document) => ({
      params: { id: blog.$id },
    }));

    return {
      paths,
      fallback: 'blocking', // For SSR on demand for new pages
    };
  } catch (error) {
    console.error('Error fetching blog paths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { id } = params as { id: string };

  try {
    // Fetch the blog details using its ID
    const blog = await db.blogs.get(id);

    // Get the image URL using the image id from the storage service
    const imageResponse = await storageServices.images.getFileView(
      blog.imageUrl
    );
    const imageUrl = imageResponse.href;

    return {
      props: {
        title: blog.title || 'Blog Title',
        content: blog.content || '<p>No content available.</p>',
        imageUrl,
        ...(await serverSideTranslations(locale!, [
          'common',
          'forms',
          'menu',
          'blog',
          'footer',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching blog details:', error);
    return {
      props: {
        title: 'Blog Title',
        content: '<p>No content available.</p>',
        imageUrl: '/assets/images/placeholder.jpg',
        ...(await serverSideTranslations(locale!, [
          'common',
          'forms',
          'menu',
          'blog',
          'footer',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  }
};

export default BlogDetailsPage;
