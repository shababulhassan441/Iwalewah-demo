// src/framework/product/get-all-wholesale-products.ts

import { QueryOptionsType, Product } from '@framework/types';
import { useInfiniteQuery } from 'react-query';
import db from 'src/appwrite/Services/dbServices'; // Adjust the path as necessary
import { Query } from 'appwrite';

type PaginatedProduct = {
  data: Product[];
  nextCursor: string | null;
};

/**
 * Define a more specific type for the database wholesale product
 */
interface DBProduct {
  $id: string;
  name: string;
  description: string;
  price: string; // Assuming price is stored as string in Appwrite
  discountPrice?: string;
  stockQuantity: string; // Assuming stockQuantity is stored as string in Appwrite
  categoryId: string;
  images: string[];
  tags?: string[]; // Optional if tags can be undefined
  isOnSale: boolean;
  isWholesaleProduct: boolean;
  bannerLabel?: string;
  videoId?: string[]; // Add this line
}

/**
 * Fetches wholesale products from Appwrite with optional search filtering using cursor-based pagination.
 */
const fetchWholesaleProducts = async ({ queryKey, pageParam = null }: any): Promise<PaginatedProduct> => {
  const [_key, options] = queryKey;
  const { categoryId, sortBy, search, limit = 20 } = options as QueryOptionsType;

  // Build the query array based on category and sorting options
  let queries: any[] = [];

  if (categoryId) {
    queries.push(Query.equal('categoryId', categoryId));
  }

  // Filter to fetch only wholesale products
  queries.push(Query.equal('isWholesaleProduct', true));

  // Apply sorting based on `sortBy` value
  if (sortBy === 'lowest') {
    queries.push(Query.orderAsc('price'));
  } else if (sortBy === 'highest') {
    queries.push(Query.orderDesc('price'));
  } else if (sortBy === 'new-arrival') {
    queries.push(Query.orderDesc('$createdAt'));
  } else {
    // Default sorting if sortBy is not provided
    queries.push(Query.orderDesc('$createdAt'));
  }

  // Apply pagination using cursor
  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam));
  }

  // Set the limit for each page
  queries.push(Query.limit(limit));

  // Optimize data fetching by selecting only necessary fields
  queries.push(
    Query.select([
      '$id',
      'name',
      'description',
      'price',
      'discountPrice',
      'stockQuantity',
      'categoryId',
      'images',
      'tags',
      'isOnSale',
      'isWholesaleProduct',
      'bannerLabel',
      'minimumPurchaseQuantity',
      'videoId',
    ])
  );

  try {
    // Fetch products from the Appwrite Products collection
    const response = await db.Products.list(queries);

    // Map database products to your Product type with default tags and proper parsing
    const mappedProducts: any[] = response.documents.map((product: any) => ({
      id: product.$id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
      stockQuantity: parseInt(product.stockQuantity, 10),
      categoryId: product.categoryId,
      images: product.images,
      tags: product.tags || [], // Ensure tags is always an array
      isOnSale: Boolean(product.isOnSale),
      isWholesaleProduct: Boolean(product.isWholesaleProduct),
      bannerLabel: product.bannerLabel || '',
      videoId: product.videoId || [], // Add this line
      minimumPurchaseQuantity: product.minimumPurchaseQuantity || 1,
    }));

    // If there's a search keyword, perform client-side filtering
    let filteredProducts = mappedProducts;
    if (search) {
      const keyword = search.toLowerCase();

      filteredProducts = mappedProducts.filter((product) => {
        // Concatenate name and tags into a single string
        const combinedString = `${product.name} ${product.tags.join(' ')}`.toLowerCase();
        return combinedString.includes(keyword);
      });
    }

    // Determine the next cursor
    const lastProduct = response.documents[response.documents.length - 1];
    const nextCursor = lastProduct ? lastProduct.$id : null;

    // If there is no next cursor, set it to null
    const hasNextPage = response.documents.length === limit;
    const finalNextCursor = hasNextPage ? nextCursor : null;

    return {
      data: filteredProducts,
      nextCursor: finalNextCursor,
    };
  } catch (error) {
    console.error('Error fetching wholesale products:', error);
    throw new Error('Failed to fetch wholesale products');
  }
};

/**
 * Custom hook to fetch wholesale products using React Query's useInfiniteQuery.
 */
const useWholesaleProductsQuery = (options: QueryOptionsType) => {
  return useInfiniteQuery<PaginatedProduct, Error>(
    ['wholesale-products', options],
    fetchWholesaleProducts,
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      onError: (error) => {
        console.error('Error in useWholesaleProductsQuery:', error);
      },
    }
  );
};

export { useWholesaleProductsQuery, fetchWholesaleProducts };
