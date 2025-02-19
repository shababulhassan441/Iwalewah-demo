// src/components/product/product-grid.tsx

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Alert from '@components/ui/alert';
import Button from '@components/ui/button';
import ProductCard from '@components/product/product-cards/product-card';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import cn from 'classnames';
import { useProductsQuery } from '@framework/product/get-all-products';
import { useWholesaleProductsQuery } from '@framework/product/get-all-wholesale-products';
import { LIMITS } from '@framework/utils/limits';
import { Product } from '@framework/types';
import { useUser } from 'src/contexts/user.context'; // Import useUser hook

interface ProductGridProps {
  className?: string;
  isWholesaleProduct?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  className = '',
  isWholesaleProduct = false,
}) => {
  const { t } = useTranslation('common');
  const { query } = useRouter();

  // Extract the search query 'q' from the URL
  const searchQuery = query.q ? String(query.q) : '';

  // Get user info and loading state
  const { user: userInfo, loading: userLoading } = useUser();

  // Call both hooks unconditionally
  const wholesaleProducts = useWholesaleProductsQuery({
    limit: LIMITS.PRODUCTS_LIMITS,
    categoryId: query?.category as string,
    sortBy: query?.sort_by as string,
    search: searchQuery,
  });

  const regularProducts = useProductsQuery({
    limit: LIMITS.PRODUCTS_LIMITS,
    categoryId: query?.category as string,
    sortBy: query?.sort_by as string,
    isWholesaleProduct,
    search: searchQuery,
  });

  // Choose which data to use based on `isWholesaleProduct`
  const {
    isFetching: isLoading,
    isFetchingNextPage: loadingMore,
    fetchNextPage,
    hasNextPage,
    data,
    error,
  } = isWholesaleProduct ? wholesaleProducts : regularProducts;

  // Early return if data or user info is loading
  if (isLoading || userLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-5',
          className
        )}
      >
        {Array.from({ length: 30 }).map((_, idx) => (
          <ProductCardLoader
            key={`product--key-${idx}`}
            uniqueKey={`product--key-${idx}`}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3 md:gap-4 2xl:gap-5',
          className
        )}
      >
        {error ? (
          <div className="col-span-full">
            <Alert message={error?.message} />
          </div>
        ) : (
          data?.pages?.map((page: any) =>
            page?.data
              ?.filter((product: Product) => {
                // If the product is wholesale, only display if the user is approved
                if (product.isWholesaleProduct) {
                  return userInfo?.isWholesaleApproved;
                }
                return true; // Display regular products
              })
              .map((product: Product) => (
                <ProductCard
                  key={`product--key-${product.id}`}
                  product={product}
                />
              ))
          )
        )}
      </div>
      {hasNextPage && (
        <div className="text-center pt-8 xl:pt-10">
          <Button
            loading={loadingMore}
            disabled={loadingMore}
            onClick={() => fetchNextPage()}
          >
            {t('button-load-more')}
          </Button>
        </div>
      )}
    </>
  );
};
