import { Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from 'react-query';
import db from 'src/appwrite/Services/dbServices';

export const useProductQuery = (id: string) => {
  return useQuery<Product, Error>(['product', id], async () => {
    try {
      const productDoc = await db['Products'].get(id);
      // Map the document to your Product type
      const product: any = {
        id: productDoc.$id,
        name: productDoc.name,
        description: productDoc.description,
        price: productDoc.price,
        discountPrice: productDoc.discountPrice,
        stockQuantity: productDoc.stockQuantity,
        categoryId: productDoc.categoryId,
        images: productDoc.images,
        tags: productDoc.tags || [],
        isOnSale: productDoc.isOnSale,
        isWholesaleProduct: productDoc.isWholesaleProduct,
        wholesalePrice: productDoc.wholesalePrice,
        minimumPurchaseQuantity: productDoc.minimumPurchaseQuantity || 1,
        bannerLabel: productDoc.bannerLabel,
        videoId: productDoc.videoId || [],
      };
      return product;
    } catch (error) {
      throw new Error('Product not found');
    }
  });
};
