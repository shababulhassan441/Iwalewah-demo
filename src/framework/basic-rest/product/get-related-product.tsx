// @framework/product/get-related-product.ts

import { useQuery } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { Product } from '@framework/types';
import { Query } from 'appwrite';

interface UseRelatedProductsQueryParams {
  tags: string[];
  categoryId: string;
  currentProductId: string;
  limit?: number;
}

export function useRelatedProductsQuery({
  tags,
  categoryId,
  currentProductId,
  limit,
}: UseRelatedProductsQueryParams) {
  return useQuery<Product[], Error>(
    ['relatedProducts', currentProductId],
    async () => {
      // Build queries to filter by category and exclude the current product
      const queries = [
        Query.equal('categoryId', categoryId),
        Query.notEqual('$id', currentProductId),
      ];

      // Fetch products from the "Products" collection
      const response = await db['Products'].list(queries);

      // Map response.documents (Models.Document[]) to Product[]
      const products: Product[] = response.documents.map((doc) => {
        const product: any = {
          id: doc.$id,
          name: doc.name,
          description: doc.description,
          price: doc.price,
          discountPrice: doc.discountPrice,
          stockQuantity: doc.stockQuantity,
          categoryId: doc.categoryId,
          images: doc.images,
          tags: doc.tags || [],
          isOnSale: doc.isOnSale,
          isWholesaleProduct: doc.isWholesaleProduct,
          videoId: doc.videoId || [],
          wholesalePrice: doc.wholesalePrice,
        };
        return product;
      });

      // Rank products based on the number of matching tags
      const rankedProducts = products
        .map((product) => {
          const productTags = product.tags || [];
          const matchingTags = productTags.filter((tag) => tags.includes(tag));
          return {
            product,
            matchCount: matchingTags.length,
          };
        })
        .sort((a, b) => b.matchCount - a.matchCount)
        .map((item) => item.product);

      // Limit the results if a limit is provided
      const relatedProducts = limit ? rankedProducts.slice(0, limit) : rankedProducts;

      return relatedProducts;
    }
  );
}
