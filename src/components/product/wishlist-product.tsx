import WishlistProductCard from '@components/product/wishlist-product-card';
import type { FC } from 'react';
import { useWishlistProductsQuery } from '@framework/product/get-wishlist-product';
import ProductCardLoader from '@components/ui/loaders/product-card-loader';
import Alert from '@components/ui/alert';
import cn from 'classnames';
import { FiHeart } from 'react-icons/fi'; // Importing an icon for the empty state

interface ProductWishlistProps {
  element?: any;
  className?: string;
}

const ProductWishlistGrid: FC<ProductWishlistProps> = ({
  element,
  className = '',
}) => {
  const limit = 35;
  const { data, isLoading, error } = useWishlistProductsQuery() as any;

  return (
    <div className={cn(className)}>
      {error ? (
        <Alert message={error?.message} />
      ) : (
        <div className="flex flex-col">
          {isLoading && !data?.length ? (
            Array.from({ length: 35 }).map((_, idx) => (
              <ProductCardLoader
                key={`product--key-${idx}`}
                uniqueKey={`product--key-${idx}`}
              />
            ))
          ) : data?.length > 0 ? (
            data.map((product: any) => (
              <WishlistProductCard
                key={`product--key${product.id}`}
                product={product}
              />
            ))
          ) : (
            // Display this when no wishlist items are found
            <div className="flex flex-col items-center justify-center mt-10">
              <FiHeart className="text-6xl text-gray-400 mb-4" />
              <p className="text-xl text-gray-500">
                Your wishlist is empty.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Start adding your favorite products!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductWishlistGrid;
