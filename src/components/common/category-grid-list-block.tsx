// src/components/blocks/category-grid-list-block.tsx

import SectionHeader from '@components/common/section-header';
import CategoryListCardLoader from '@components/ui/loaders/category-list-card-loader';
import { useCategoriesQuery } from '@framework/category/get-all-categories';
import Alert from '@components/ui/alert';
import CategoryListCard from '@components/cards/category-list-card';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from 'swiper/react';
import useWindowSize from '@utils/use-window-size';
import cn from 'classnames';
import { ROUTES } from '@utils/routes';

interface CategoriesProps {
  className?: string;
}

const breakpoints = {
  '1480': {
    slidesPerView: 5,
  },
  '920': {
    slidesPerView: 3,
  },
  '600': {
    slidesPerView: 2,
  },
  '0': {
    slidesPerView: 1,
  },
};

/**
 * Helper function to format category name
 * Replaces spaces with hyphens and converts to lowercase
 */
const formatCategoryName = (name: string): string =>
  name.replace(/\s+/g, '-').toLowerCase();

/**
 * CategoryGridListBlock Component
 * Displays categories in a responsive grid or carousel with both name and ID in the URL.
 */
const CategoryGridListBlock: React.FC<CategoriesProps> = ({
  className = 'mb-12 lg:mb-14 xl:mb-16 2xl:mb-20',
}) => {
  const { width } = useWindowSize();
  const { data, isLoading, error } = useCategoriesQuery();

  return (
    <div className={cn(className)}>
      <div className="pt-0.5 pb-1.5">
        <SectionHeader
          sectionHeading="Choose Categories"
          sectionSubHeading="Explore your favorite categories"
          headingPosition="center"
        />

        <div className="-mt-1.5 md:-mt-2">
          {error ? (
            <Alert message={error.message} />
          ) : width! < 1280 ? (
            <>
              <Carousel
                breakpoints={breakpoints}
                grid={{ rows: 3, fill: 'row' }}
                className="-mx-1.5 md:-mx-2"
                prevButtonClassName="ltr:-left-2 rtl:-right-2 md:ltr:-left-2.5 md:rtl:-right-2.5"
                nextButtonClassName="ltr:-right-2 rtl:-left-2 lg:ltr:-right-2.5 lg:rtl:-left-2.5"
              >
                {isLoading && !data
                  ? Array.from({ length: 8 }).map((_, idx) => (
                      <SwiperSlide
                        className="p-1.5 md:p-2"
                        key={`category--loader-${idx}`}
                      >
                        <CategoryListCardLoader
                          uniqueKey={`category-card-loader-${idx}`}
                        />
                      </SwiperSlide>
                    ))
                  : data?.categories?.map((category) => (
                      <SwiperSlide
                        key={`category--key-${category.id}`}
                        className="p-1.5 md:p-2"
                      >
                        <CategoryListCard
                          category={category}
                          href={{
                            pathname: ROUTES.SEARCH,
                            query: {
                              category: category.id, // Category ID
                              name: formatCategoryName(category.name), // Formatted Category Name
                            },
                          }}
                          className="rounded-md text-brand-light shadow-category"
                        />
                      </SwiperSlide>
                    ))}
              </Carousel>
            </>
          ) : (
            <div className="flex-wrap justify-center -mx-1 xl:flex">
              {isLoading && !data
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={`category--loader-${idx}`}
                      className="w-1/4 2xl:w-1/5 3xl:w-1/6 shrink-0 p-2"
                    >
                      <CategoryListCardLoader
                        uniqueKey={`category-card-loader-${idx}`}
                      />
                    </div>
                  ))
                : data?.categories?.map((category) => (
                    <div
                      key={`category--key-${category.id}`}
                      className="w-1/4 2xl:w-1/5 3xl:w-1/6 shrink-0 p-2"
                    >
                      <CategoryListCard
                        category={category}
                        href={{
                          pathname: ROUTES.SEARCH,
                          query: {
                            name: formatCategoryName(category.name), // Formatted Category Name
                            category: category.id, // Category ID
                          },
                        }}
                        className="rounded-md text-brand-light shadow-category"
                      />
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryGridListBlock;
