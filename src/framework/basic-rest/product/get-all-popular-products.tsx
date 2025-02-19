import { useQuery } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Product } from '@framework/types';
import { LIMITS } from '@framework/utils/limits';
import { Query } from 'appwrite'; // Ensure correct import path

interface QueryOptionsType {
  limit: number;
}

interface AggregatedProduct {
  productId: string;
  totalQuantity: number;
}

export const fetchMostOrderedProducts = async ({ queryKey }: any): Promise<Product[]> => {
  const [_key, options] = queryKey;
  const { limit } = options as QueryOptionsType;

  try {
    let allOrderItems: any[] = [];
    let cursor: string | undefined = undefined;
    const batchLimit = 100; 

    // Step 1: Fetch all OrderItems using pagination
    while (true) {
      const queries = [
        Query.limit(batchLimit),
        Query.orderAsc('$createdAt'), // Use the correct system attribute
        Query.select(['productId', 'quantity', 'isWholesaleProduct']), // Optimize data fetching
      ];

      if (cursor) {
        queries.push(Query.cursorAfter(cursor));
      }

      const response = await db['OrderItems'].list(queries);

      allOrderItems = allOrderItems.concat(response.documents);

      if (response.documents.length < batchLimit) {
        break; // No more documents to fetch
      }

      // Update the cursor to the last document's ID for the next batch
      cursor = response.documents[response.documents.length - 1].$id;
    }

    if (!allOrderItems.length) {
      // No orders exist, fetch default products based on limit
      const defaultProductsResponse = await db['Products'].list([
        Query.limit(limit),
        Query.orderAsc('$createdAt'), // Use the correct system attribute
      ]);

      const defaultProducts = defaultProductsResponse.documents
        .filter((product: any) => !product.isWholesaleProduct)
        .map(mapProductDocument);

      return defaultProducts;
    }

    // Step 2: Aggregate total quantities per productId
    const aggregationMap: Record<string, number> = {};

    allOrderItems.forEach((item: any) => {
      if (!item.isWholesaleProduct) { // Exclude wholesale products at aggregation
        if (aggregationMap[item.productId]) {
          aggregationMap[item.productId] += item.quantity;
        } else {
          aggregationMap[item.productId] = item.quantity;
        }
      }
    });

    // Convert the aggregation map to an array and sort it
    const aggregatedProducts: AggregatedProduct[] = Object.entries(aggregationMap).map(
      ([productId, totalQuantity]) => ({
        productId,
        totalQuantity,
      })
    );

    aggregatedProducts.sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Get top productIds based on the limit
    const topProductIds = aggregatedProducts.slice(0, limit).map(item => item.productId);

    if (!topProductIds.length) {
      // If after filtering no products, fetch default products
      const defaultProductsResponse = await db['Products'].list([
        Query.limit(limit),
        Query.orderAsc('$createdAt'), // Use the correct system attribute
      ]);

      const defaultProducts = defaultProductsResponse.documents
        .filter((product: any) => !product.isWholesaleProduct)
        .map(mapProductDocument);

      return defaultProducts;
    }

    // Step 3: Fetch product details for topProductIds using parallel get requests
    const productPromises = topProductIds.map(productId =>
      db['Products'].get(productId).catch((error) => {
        return null; // Return null if product is not found
      })
    );

    const products = await Promise.all(productPromises);
    const filteredProducts = products
      .filter(
        (product: any) =>
          product && product.isWholesaleProduct === false
      )
      .map(mapProductDocument);

    return filteredProducts;
  } catch (error) {
    console.error('Error fetching most ordered products:', error);
    throw new Error('Failed to fetch most ordered products');
  }
};

// Helper function to map product documents to Product type
const mapProductDocument = (product: any): any => ({
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
  videoId: product.videoId || [],
  bannerLabel: product.bannerLabel || '',
});

export const useMostOrderedProductsQuery = (options: QueryOptionsType) => {
  return useQuery<Product[], Error>(
    ['MOST_ORDERED_PRODUCTS', options],
    fetchMostOrderedProducts,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      onError: (error) => {
        console.error('Error in useMostOrderedProductsQuery:', error);
      }
    }
  );
};
