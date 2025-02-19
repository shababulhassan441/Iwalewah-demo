import { useQuery } from 'react-query';
import CollectionCard from '@components/cards/collection-card';
import SectionHeader from '@components/common/section-header';
import Container from '@components/ui/container';
import useWindowSize from '@utils/use-window-size';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from '@components/ui/carousel/slider';
import db from 'src/appwrite/Services/dbServices';
import storageServices from 'src/appwrite/Services/storageServices';
import { ROUTES } from '@utils/routes';
import Link from 'next/link'; // Import Link for navigation

interface Props {
  className?: string;
  headingPosition?: 'left' | 'center';
}

const breakpoints = {
  '1024': {
    slidesPerView: 3,
  },
  '768': {
    slidesPerView: 3,
  },
  '540': {
    slidesPerView: 2,
  },
  '0': {
    slidesPerView: 1,
  },
};

// Fetch blogs and images using useQuery
const fetchBlogs = async () => {
  const response = await db.blogs.list();
  const blogsData = response.documents;

  const updatedBlogs = await Promise.all(
    blogsData.map(async (blog: any) => {
      const imageUrl = storageServices.images
        .getFileView(blog.imageUrl)
        .toString();
      return { ...blog, imageUrl };
    })
  );

  return updatedBlogs;
};

const CollectionGrid: React.FC<Props> = ({
  className = 'mb-12 lg:mb-14 xl:mb-16 2xl:mb-20 pb-1 lg:pb-0 3xl:pb-2.5',
  headingPosition = 'left',
}) => {
  const { width } = useWindowSize();

  // Using useQuery to fetch the blogs
  const { data: blogs, isLoading, error } = useQuery('blogs', fetchBlogs);

// Inline spinner JSX
const spinner = (
  <div className="flex justify-center items-center h-full py-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-gray-300"></div>
  </div>
);

if (isLoading) return spinner; // 
  if (error) return <p>Error loading blogs</p>;

  return (
    <div className={className}>
      <Container>
        <SectionHeader
          sectionHeading="Blogs"
          sectionSubHeading=""
          headingPosition={headingPosition}
        />
        {width! < 1536 ? (
          <Carousel
            breakpoints={breakpoints}
            autoplay={{ delay: 4000 }}
            prevButtonClassName="ltr:-left-2.5 rtl:-right-2.5 -top-14"
            nextButtonClassName="ltr:-right-2.5 rtl:-left-2.5 -top-14"
            className="-mx-1.5 md:-mx-2 xl:-mx-2.5 -my-4"
            prevActivateId="collection-carousel-button-prev"
            nextActivateId="collection-carousel-button-next"
          >
            {blogs?.map((blog) => (
              <SwiperSlide
                key={`collection-key-${blog.$id}`}
                className="px-1.5 md:px-2 xl:px-2.5 py-4"
              >
                <CollectionCard
                  key={blog.$id}
                  collection={blog}
                  href={`/blogs/${blog.$id}`}
                />
              </SwiperSlide>
            ))}
          </Carousel>
        ) : (
          <div className="gap-5 2xl:grid 2xl:grid-cols-4 3xl:gap-7">
            {blogs?.map((blog) => (
              <CollectionCard
                key={blog.$id}
                collection={blog}
                href={`/blogs/${blog.$id}`}
              />
            ))}
          </div>
        )}

        {/* All Blogs Button */}
        <div className="mt-8 flex justify-center">
          <Link href="/blogs">
            <a className="px-6 py-3 text-white bg-brand rounded-md hover:bg-brand-dark transition duration-300">
              View All Blogs
            </a>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default CollectionGrid;
