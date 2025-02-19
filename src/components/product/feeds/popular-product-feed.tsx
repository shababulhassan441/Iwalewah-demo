import type { FC } from 'react';
import { useMostOrderedProductsQuery } from '@framework/product/get-all-popular-products';
import ProductsGridBlock from '@components/product/products-grid-block';
import { LIMITS } from '@framework/utils/limits';

interface ProductFeedProps {
  className?: string;
}

const MostOrderedProductFeed: FC<ProductFeedProps> = ({ className }) => {
  const limit = LIMITS.POPULAR_PRODUCTS_LIMITS;
  const { data, isLoading, error } = useMostOrderedProductsQuery({
    limit: limit,
  });

  return (
    <ProductsGridBlock
      sectionHeading="text-popular-product"
      sectionSubHeading="text-fresh-grocery-items"
      className={className}
      products={data}
      loading={isLoading}
      error={error?.message}
      limit={limit}
      uniqueKey="most-ordered-product"
    />
  );
};

export default MostOrderedProductFeed;
