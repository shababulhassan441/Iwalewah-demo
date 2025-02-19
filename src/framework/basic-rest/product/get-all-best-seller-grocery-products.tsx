import { QueryOptionsType, Product } from '@framework/types';
import db from 'src/appwrite/Services/dbServices'; // Appwrite DB service
import { Query } from 'appwrite';
import { useQuery } from 'react-query';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';

export const fetchBestSellerGroceryProducts = async ({ queryKey }: any): Promise<Product[]> => {
  const [_key, options] = queryKey;
  const { limit = 10 } = options as QueryOptionsType;  // Provide a default value

  try {
    let allProducts: any[] = [];
    let cursor: string | undefined = undefined;
    const batchLimit = 100; // Adjust based on Appwrite's maximum allowed limit per request

    // Fetch products in batches using pagination
    while (true) {
      // Calculate the remaining number of products to fetch
      const remaining = limit - allProducts.length;
      if (remaining <= 0) {
        break;
      }

      const queries = [
        Query.equal('isOnSale', true),
        Query.equal('isWholesaleProduct', false),
        Query.limit(Math.min(batchLimit, remaining)),
        Query.orderAsc('$createdAt'), // Optional: Order by a specific field
        Query.select([
          '$id', 'name', 'description', 'price', 'discountPrice', 'stockQuantity', 'categoryId', 'images', 'tags', 'isOnSale', 'isWholesaleProduct', 'bannerLabel', 'videoId',
        ]), // Select only necessary fields
      ];

      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await db.Products.list(queries);

      allProducts = allProducts.concat(response.documents);

      // If fewer documents are returned than the batch limit, we've fetched all matching products
      if (response.documents.length < Math.min(batchLimit, remaining)) {
        break;
      }

      // Update the cursor to the last document's ID for the next batch
      cursor = response.documents[response.documents.length - 1].$id;
    }

    // Map the fetched documents to your Product type
    const products: any[] = allProducts.slice(0, limit).map((product: any) => ({
      id: product.$id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
      stockQuantity: parseInt(product.stockQuantity, 10),
      categoryId: product.categoryId,
      images: product.images,
      tags: product.tags || [],
      isOnSale: Boolean(product.isOnSale),
      isWholesaleProduct: Boolean(product.isWholesaleProduct),
      bannerLabel: product.bannerLabel || '',
      videoId: product.videoId || [],
    }));

    return products;
  } catch (error) {
    console.error('Error fetching best seller grocery products:', error);
    throw new Error('Failed to fetch best seller grocery products');
  }
};

export const useBestSellerGroceryProductsQuery = (
  options: QueryOptionsType
) => {
  return useQuery<Product[], Error>(
    [API_ENDPOINTS.BEST_SELLER_GROCERY_PRODUCTS, options],
    fetchBestSellerGroceryProducts,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      onError: (error) => {
        console.error('Error in useBestSellerGroceryProductsQuery:', error);
      }
    }
  );
};
