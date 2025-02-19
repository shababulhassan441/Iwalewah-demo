// src/framework/order/get-all-orders.ts

import { QueryOptionsType } from '@framework/types'; 
import { useQuery } from 'react-query'; 
import db from 'src/appwrite/Services/dbServices'; // Import Appwrite dbServices
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { Models, Query } from 'appwrite';
import { Order } from './get-order';

// export interface OrderDocument {
//   $id: string;
//   userId: string;
//   totalPrice: number;
//   orderStatus: string;
//   paymentStatus: string;
//   createdAt: string;
//   updatedAt: string;
//   address: string;
//   phoneNumber: string;
//   email: string;
//   paymentMethod: string;
//   deliveryInstructions: string;
//   paymentIntentId: string;
//   stripeOrderId: string;
//   transactionId: string
// }

const fetchOrders = async ({ queryKey }: any) => { 
  const [_key, { userId }] = queryKey; 
  // Fetch orders from Appwrite's "Orders" collection where userId equals the current userId
  const response = await db.Orders.list([
    Query.equal('userId', userId),
    Query.orderDesc('createdAt'), // Sorting orders from new to old
  ]);
  const ordersData = response.documents as unknown as Order[];
  
  return { 
    data: ordersData, 
  }; 
}; 

const useOrdersQuery = (options: QueryOptionsType, userId: string | null) => { 
  return useQuery(
    ['Orders', { ...options, userId }],
    fetchOrders,
    {
      enabled: !!userId, // Only run query if userId is present
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  ); 
}; 

export { useOrdersQuery, fetchOrders };
