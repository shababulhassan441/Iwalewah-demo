// src/framework/order/get-order-items.ts

import { QueryOptionsType } from '@framework/types'; 
import { useQuery } from 'react-query'; 
import db from 'src/appwrite/Services/dbServices'; // Import Appwrite dbServices
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { Models, Query } from 'appwrite';

export interface OrderItemDocument {
  $id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  description: string;
  discountPrice: number;
  categoryId: string;
  images: string[];
  tags: string[];
  isOnSale: boolean;
  wholesalePrice: number;
  isWholesaleProduct: boolean;
}

const fetchOrderItems = async ({ queryKey }: any) => { 
  const [_key, { orderId }] = queryKey; 
  // Fetch order items from Appwrite's "OrderItems" collection where orderId equals the given orderId
  const response = await db.OrderItems.list([
    Query.equal('orderId', orderId),
  ]);
  const orderItemsData = response.documents as unknown as OrderItemDocument[];
  
  return { 
    data: orderItemsData, 
  }; 
}; 

const useOrderItemsQuery = (options: QueryOptionsType, orderId: string | null) => { 
  return useQuery(
    ['OrderItems', { ...options, orderId }],
    fetchOrderItems,
    {
      enabled: !!orderId, // Only run query if orderId is present
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  ); 
}; 

export { useOrderItemsQuery, fetchOrderItems };
