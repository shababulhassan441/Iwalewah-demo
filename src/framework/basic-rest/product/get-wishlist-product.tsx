import { useQuery, useQueryClient } from 'react-query';
import { Product } from '@framework/types';
import db from 'src/appwrite/Services/dbServices';
import storageServices from 'src/appwrite/Services/storageServices';
import { useAuth } from 'src/hooks/useAuth';
import { Query } from 'appwrite';

export const fetchWishlistProducts = async (userId: string): Promise<Product[]> => {
  // Fetch the Wishlist document for the user
  const wishlistList = await db.Wishlist.list([Query.equal('userId', userId)]);

  if (wishlistList.documents.length === 0) {
    return []; // Return empty array if no wishlist exists
  }

  const wishlist = wishlistList.documents[0];

  if (!Array.isArray(wishlist.productIds) || wishlist.productIds.length === 0) {
    return []; // Return empty array if wishlist is empty or invalid
  }

  // Ensure all productIds are valid strings
  const productIds: string[] = wishlist.productIds
    .map((id: any) => id?.toString())
    .filter((id: string | undefined) => id);

  if (productIds.length === 0) {
    return []; // No valid product IDs
  }

  // Fetch Products based on productIds
  const productsList = await db.Products.list([
    Query.equal('$id', productIds),
  ]);

  // Map '$id' to 'id' for each product
  const products = productsList.documents.map((productDoc) => ({
    ...productDoc,
    id: productDoc.$id, // Map '$id' to 'id'
  })) as any;

  // Fetch Image URLs for each product
  const productsWithImages = await Promise.all(
    products.map(async (product :any) => {
      if (product.images && product.images.length > 0) {
        const imageUrls = await Promise.all(
          product.images.map(async (imageId:any) => {
            try {
              const imageURL = await storageServices.images.getFileDownload(imageId);
              return imageURL.toString();
            } catch (error) {
              console.error(`Error fetching image URL for ID: ${imageId}`, error);
              return '/assets/placeholder/product.svg'; // Fallback image
            }
          })
        );
        return { ...product, imageUrls };
      }
      return { ...product, imageUrls: ['/assets/placeholder/product.svg'] };
    })
  );

  return productsWithImages;
};

export const useWishlistProductsQuery = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  return useQuery<Product[], Error>(
    ['wishlist', user?.userId],
    () => (user ? fetchWishlistProducts(user.userId) : Promise.resolve([])),
    {
      enabled: !!user && !loading, // Only run the query if user is available and not loading
      // staleTime: 1000 * 60 * 5, // 5 minutes
      // cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: true, // Ensure it refetches on window focus
      refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes to keep data fresh
      onSuccess: () => {
        // Clear and refetch to ensure the UI updates immediately on wishlist change
        queryClient.invalidateQueries(['wishlist', user?.userId]);
      },
      onError: (error) => {
        console.error('Error fetching wishlist products:', error);
      },
    }
  );
};
