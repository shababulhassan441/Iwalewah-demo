// src/components/product/wishlist-product-card.tsx

import { FC, useEffect } from 'react';
import Link from 'next/link';
import Image from '@components/ui/image';
import usePrice from '@framework/product/use-price';
import { Product } from '@framework/types';
import { useTranslation } from 'next-i18next';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import { useAuth } from 'src/hooks/useAuth';
import { useQueryClient } from 'react-query';
import { useUser } from 'src/contexts/user.context';

interface ProductProps {
  product: Product;
  className?: string;
}

const WishlistProductCard: FC<ProductProps> = ({ product, className }) => {
  const { t } = useTranslation('common');
  const { id, name, imageUrls, unit, isWholesaleProduct } = product ?? {};
  const placeholderImage = '/assets/placeholder/product.svg';

  const { price, basePrice, discount } = usePrice({
    amount: product.discountPrice ? product.discountPrice : product.price,
    baseAmount: product.price,
    currencyCode: 'GBP',
  });

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { user: userInfo, loading } = useUser();

  useEffect(() => {
    const checkAndRemoveWholesaleProduct = async () => {
      if (isWholesaleProduct && !loading) {
        if (!userInfo || !userInfo.isWholesaleApproved) {
          // Remove the wholesale product from the wishlist
          if (!user) {
            console.error('User not authenticated');
            return;
          }

          try {
            const wishlistList = await db.Wishlist.list([
              Query.equal('userId', user.userId),
            ]);

            if (wishlistList.documents.length === 0) {
              console.error('Wishlist not found');
              return;
            }

            const wishlist = wishlistList.documents[0];

            const productIds = Array.isArray(wishlist.productIds)
              ? wishlist.productIds.map((pid: any) => pid.toString())
              : [];

            const updatedProductIds = productIds.filter(
              (productId: string) => productId !== id
            );

            await db.Wishlist.update(wishlist.$id, {
              productIds: updatedProductIds,
            });

            // Invalidate the wishlist query to update the UI
            queryClient.invalidateQueries(['wishlist', user.userId]);
          } catch (error) {
            console.error('Error updating wishlist:', error);
          }
        }
      }
    };

    checkAndRemoveWholesaleProduct();
  }, [isWholesaleProduct, userInfo, loading, id, user, queryClient]);

  // If the product is a wholesale product and the user is not approved, don't render the component
  if (isWholesaleProduct && (!userInfo || !userInfo.isWholesaleApproved)) {
    return null;
  }

  // Define the handleRemoveFromWishlist function
  const handleRemoveFromWishlist = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevents default link navigation
    event.stopPropagation(); // Prevents the click from propagating to parent elements

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const wishlistList = await db.Wishlist.list([
        Query.equal('userId', user.userId),
      ]);

      if (wishlistList.documents.length === 0) {
        console.error('Wishlist not found');
        return;
      }

      const wishlist = wishlistList.documents[0];

      const productIds = Array.isArray(wishlist.productIds)
        ? wishlist.productIds.map((pid: any) => pid.toString())
        : [];

      const updatedProductIds = productIds.filter(
        (productId: string) => productId !== id
      );

      await db.Wishlist.update(wishlist.$id, {
        productIds: updatedProductIds,
      });

      // Invalidate the wishlist query to update the UI
      queryClient.invalidateQueries(['wishlist', user.userId]);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  return (
    <Link href={`/products/${id}`} passHref>
      <a
        className={`flex flex-col py-4 border-b md:flex-row border-border-base 2xl:py-5 wishlist-card hover:bg-gray-50 last:pb-0 first:mt-0 lg:first:mt-0 2xl:first:mt-0 ${className}`}
      >
        <div className="flex">
          <div className="relative mt-1 shrink-0">
            <div className="flex overflow-hidden max-w-[80px] transition duration-200 ease-in-out transform group-hover:scale-105">
              <Image
                src={
                  imageUrls && imageUrls.length > 0 ? imageUrls[0] : placeholderImage
                }
                alt={name || 'Product Image'}
                width={80}
                height={80}
                quality={100}
                className="object-cover bg-fill-thumbnail"
                unoptimized
              />
            </div>
          </div>

          <div className="flex flex-col ltr:ml-4 rtl:mr-4 2xl:ltr:ml-6 2xl:rtl:mr-6 h-full">
            <h2 className="text-brand-dark text-13px sm:text-sm lg:text-15px leading-5 sm:leading-6 mb-1.5">
              {name}
            </h2>
            <div className="mb-1 text-13px sm:text-sm lg:mb-2">{unit}</div>
            <div className="-mx-1">
              <span className="inline-block mx-1 text-sm font-semibold sm:text-15px lg:text-base text-brand-dark">
                {price}
              </span>
              {discount && (
                <del className="mx-1 text-sm text-opacity-50 text-brand-dark">
                  {basePrice}
                </del>
              )}
            </div>
          </div>
        </div>
        <button
          className="flex items-center ltr:ml-auto rtl:mr-auto md:pt-7 text-red-500 hover:text-red-700"
          onClick={handleRemoveFromWishlist}
        >
          <svg
            className="w-5 h-5 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 3a1 1 0 000 2h8a1 1 0 100-2H6zM5 7a1 1 0 011-1h8a1 1 0 011 1v9a2 2 0 01-2 2H7a2 2 0 01-2-2V7z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ltr:ml-2 rtl:mr-2 font-semibold text-15px">
            Remove
          </span>
        </button>
      </a>
    </Link>
  );
};

export default WishlistProductCard;
