// src/components/product/related-product-feed.tsx

import React, { useEffect, useState } from 'react';
import ProductsCarousel from '@components/product/products-carousel';
import { useRelatedProductsQuery } from '@framework/product/get-related-product';
import { LIMITS } from '@framework/utils/limits';
import { Product } from '@framework/types';
import { useUser } from 'src/contexts/user.context'; // Import useUser hook
import Alert from '@components/ui/alert';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';

interface RelatedProductsProps {
  tags: string[];
  categoryId: string;
  currentProductId: string;
  carouselBreakpoint?: {} | any;
  className?: string;
  uniqueKey?: string;
}

const RelatedProductFeed: React.FC<RelatedProductsProps> = ({
  tags,
  categoryId,
  currentProductId,
  carouselBreakpoint,
  className,
  uniqueKey = 'related-product-feed',
}) => {
  const { data, isLoading, error } = useRelatedProductsQuery({
    tags,
    categoryId,
    currentProductId,
    limit: LIMITS.RELATED_PRODUCTS_LIMITS,
  });

  // Get user info and loading state
  const { user: userInfo, loading: userLoading } = useUser();

  // State to hold filtered related products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Effect to filter products based on user's authorization
  useEffect(() => {
    if (data && data.length > 0) {
      const filtered = data.filter((product: Product) => {
        if (product.isWholesaleProduct) {
          return userInfo?.isWholesaleApproved;
        }
        return true;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [data, userInfo]);

  // Type Guard for error handling
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  };

  // If still loading either data or user info
  if (isLoading || userLoading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">{/* Optional Heading */}</h2>
        </div>
        <div className="flex space-x-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <ProductCardLoader
              key={`related-product-loader-${idx}`}
              uniqueKey={`related-product-loader-${idx}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Handle errors with Type Guards
  if (error) {
    return (
      <div className="w-full">
        <Alert message={getErrorMessage(error)} />
      </div>
    );
  }

  // Hide the section if there are no related products after filtering
  if (!filteredProducts || filteredProducts.length === 0) {
    return null;
  }

  return (
    <ProductsCarousel
      sectionHeading="text-related-products"
      categorySlug={`/search?category=${categoryId}`}
      className={className}
      products={filteredProducts}
      loading={isLoading || userLoading}
      error={error ? getErrorMessage(error) : undefined} // Conditionally pass error
      limit={LIMITS.RELATED_PRODUCTS_LIMITS}
      uniqueKey={uniqueKey}
      carouselBreakpoint={carouselBreakpoint}
    />
  );
};

export default RelatedProductFeed;
