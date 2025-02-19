// src/framework/order/get-order.ts

import db from 'src/appwrite/Services/dbServices'; // Import Appwrite dbServices
import { useQuery } from 'react-query';

export interface Order {
  id: string;
  userId: string;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string;
  email: string;
  paymentMethod: string;
  deliveryInstructions: string;
  paymentIntentId: string;
  stripeOrderId: string;
  customerFirstName: string;
  customerLastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  transactionId: string;
  shippingRate: number;
  orderId: string
  voucherCode: string
  discountAmount: number
}

export const fetchOrder = async (id: string): Promise<Order> => {
  try {
    const orderDoc = await db.Orders.get(id);
    
    // Map Appwrite document to Order type
    const order: Order = {
      id: orderDoc.$id,
      userId: orderDoc.userId,
      totalPrice: orderDoc.totalPrice,
      orderStatus: orderDoc.orderStatus,
      paymentStatus: orderDoc.paymentStatus,
      createdAt: orderDoc.createdAt,
      updatedAt: orderDoc.updatedAt,
      phoneNumber: orderDoc.phoneNumber,
      email: orderDoc.email,
      paymentMethod: orderDoc.paymentMethod,
      deliveryInstructions: orderDoc.deliveryInstructions,
      paymentIntentId: orderDoc.paymentIntentId,
      stripeOrderId: orderDoc.stripeOrderId,
      customerFirstName: orderDoc.customerFirstName,
      customerLastName: orderDoc.customerLastName,
      addressLine1: orderDoc.addressLine1,
      addressLine2: orderDoc.addressLine2,
      city: orderDoc.city,
      region: orderDoc.region,
      postalCode: orderDoc.postalCode,
      country: orderDoc.country,
      transactionId: orderDoc.transactionId,
      shippingRate: orderDoc.shippingRate,
      orderId: orderDoc.orderId,
      voucherCode: orderDoc.voucherCode,
      discountAmount: orderDoc.discountAmount

    };

    return order;
  } catch (error: any) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw new Error(error.message || 'Failed to fetch order.');
  }
};

export const useOrderQuery = (id: string) => {
  return useQuery<Order, Error>(['Order', id], () => fetchOrder(id), {
    enabled: !!id, // Only run query if id is present
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
