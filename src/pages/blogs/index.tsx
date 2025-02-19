// src/pages/blogs.tsx

import Layout from '@components/layout/layout';
import Seo from '@components/seo/seo';
import Container from '@components/ui/container';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import db from 'src/appwrite/Services/dbServices'; // Import dbservices
import storageServices from 'src/appwrite/Services/storageServices'; // Import storageServices
import CollectionCard from '@components/cards/collection-card'; // Card component to display blog
import { Models } from 'appwrite';
import Link from 'next/link'; // For linking to individual blogs

interface BlogsProps {
  blogs: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl: string;
  }>;
}

const backgroundThumbnail = '/assets/images/blogs-background.jpg';

function BlogsPage({ blogs }: BlogsProps) {
  const { t } = useTranslation('common');

  return (
    <span>
      <Seo
        title="Our Blogs"
        description="Browse through the latest blogs about our services and more."
        path="blogs"
      />
      {/* End of SEO */}
      {/* <div
        className="flex justify-center h-[250px] lg:h-96 2xl:h-[500px] w-full bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url(${backgroundThumbnail})`,
        }}
      ></div> */}
      <div className="py-8 lg:py-16 2xl:py-20">
        <Container>
          <div className="flex flex-col w-full mx-auto max-w-[1200px]">
            <h2 className="text-lg md:text-xl lg:text-[24px] text-brand-dark font-semibold mb-4 lg:mb-7">
              {t('Our Blogs')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <CollectionCard
                  key={blog.id}
                  collection={blog}
                  href={`/blogs/${blog.id}`}
                />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/">
                <a className="px-6 py-3 text-white bg-brand rounded-md hover:bg-brand-dark transition duration-300">
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </span>
  );
}

BlogsPage.Layout = Layout;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    // Fetch blogs from the "blogs" collection in Appwrite
    const response = await db.blogs.list();
    const blogsData = response.documents;

    // Fetch the images for each blog and prepare data for rendering
    const blogs = await Promise.all(
      blogsData.map(async (blog: Models.Document) => {
        const imageUrl = storageServices.images
          .getFileView(blog.imageUrl)
          .toString();
        return {
          id: blog.$id,
          title: blog.title || 'Untitled Blog',
          content: blog.content || 'No content available',
          imageUrl: imageUrl,
        };
      })
    );

    return {
      props: {
        blogs,
        ...(await serverSideTranslations(locale!, [
          'common',
          'footer',
          'menu',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching blog data:', error);
    return {
      props: {
        blogs: [],
        ...(await serverSideTranslations(locale!, [
          'common',
          'footer',
          'menu',
        ])),
      },
      revalidate: 60, // Revalidate every 60 seconds
    };
  }
};

export default BlogsPage;
