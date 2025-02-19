// src/framework/product/get-all-products.ts

import { QueryOptionsType, Product } from '@framework/types';
import { useInfiniteQuery } from 'react-query';
import db from 'src/appwrite/Services/dbServices'; // Appwrite DB service
import { Query } from 'appwrite';

type PaginatedProduct = {
  data: Product[];
  paginatorInfo: any;
};

// Define a more specific type for the database product
interface DBProduct {
  $id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  categoryId: string;
  images: string[];
  tags?: string[]; // Optional if tags can be undefined
  isOnSale: boolean;
  isWholesaleProduct: boolean;
  bannerLabel?: string; // Add this line
  videoId?: string[]; // Add this line
}

const fetchProducts = async ({ queryKey }: any): Promise<PaginatedProduct> => {
  const [_key, options] = queryKey;
  const {
    categoryId,
    sortBy,
    isWholesaleProduct,
    search,
    limit = 25,
    pageParam = 0,
  } = options;

  // Base queries for category and product type
  let baseQueries: any[] = [];

  if (categoryId) {
    baseQueries.push(Query.equal('categoryId', categoryId));
  }

  if (isWholesaleProduct === true) {
    baseQueries.push(Query.equal('isWholesaleProduct', true));
  } else if (isWholesaleProduct === false) {
    baseQueries.push(Query.equal('isWholesaleProduct', false));
  }

  // Apply search if the search parameter is present
  if (search) {
    const keywords = search.trim().split(/\s+/); // Split by whitespace

    if (keywords.length === 1) {
      // Single keyword search
      const keyword = keywords[0];
      baseQueries.push(
        Query.or([
          Query.search('name', keyword),
          Query.contains('tags', [keyword]),
        ])
      );
    } else if (keywords.length > 1) {
      // Multi-word search
      const keywordQueries = keywords.map((keyword: string) =>
        Query.or([
          Query.search('name', keyword),
          Query.contains('tags', [keyword]),
        ])
      );

      // Combine all keywordQueries with Query.and to ensure all keywords are matched
      baseQueries.push(Query.and(keywordQueries));
    }
    // If keywords.length === 0, no additional query is added
  }

  // Apply sorting
  if (sortBy === 'lowest') {
    baseQueries.push(Query.orderAsc('price'));
  } else if (sortBy === 'highest') {
    baseQueries.push(Query.orderDesc('price'));
  } else if (sortBy === 'new-arrival') {
    baseQueries.push(Query.orderDesc('$createdAt'));
  }

  // Apply pagination
  baseQueries.push(Query.offset(pageParam * limit));
  baseQueries.push(Query.limit(limit));

  // Fetch products based on filters and search
  const response = await db.Products.list(baseQueries);

  // Map database products to your Product type with default tags and bannerLabel
  const mappedProducts: any[] = response.documents.map((product: any) => ({
    id: product.$id,
    name: product.name,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    stockQuantity: product.stockQuantity,
    categoryId: product.categoryId,
    images: product.images,
    tags: product.tags || [], // Ensure tags is always an array
    isOnSale: product.isOnSale,
    isWholesaleProduct: product.isWholesaleProduct,
    bannerLabel: product.bannerLabel || '', // Ensure bannerLabel is present
    videoId: product.videoId || [], // Add this line
    minimumPurchaseQuantity: product.minimumPurchaseQuantity || 1,
  }));

  // Determine if there's a next page
  const hasNextPage = mappedProducts.length === limit;

  return {
    data: mappedProducts,
    paginatorInfo: {
      nextPageUrl: hasNextPage ? pageParam + 1 : null,
    },
  };
};

const useProductsQuery = (options: QueryOptionsType) => {
  return useInfiniteQuery<PaginatedProduct, Error>(
    ['products', options],
    fetchProducts,
    {
      getNextPageParam: ({ paginatorInfo }) => paginatorInfo.nextPageUrl,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep cache for 30 minutes
      keepPreviousData: true, // Keep data while fetching new pages
    }
  );
};

export { useProductsQuery, fetchProducts };
