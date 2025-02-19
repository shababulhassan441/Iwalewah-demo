// src/hooks/useProductsNotifications.ts

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import db from 'src/appwrite/Services/dbServices';
import { useAuth } from 'src/hooks/useAuth'; // Adjust the import path as needed
import { Query } from 'appwrite';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify';

dayjs.extend(relativeTime);

interface ProductNotification {
  id: string;
  productId: string;
  productName: string;
  requestStatus: 'pending' | 'notified';
  isRead: boolean;
  createdAt: string;
  notifiedAt: string | null;
}

interface UseProductsNotificationsReturn {
  notifications: ProductNotification[];
  notifiedCount: number;
  refetchNotifications: () => void;
  userId: string | null;
}

const useProductsNotifications = (): UseProductsNotificationsReturn => {
  const { user, loading } = useAuth();
  const userId = user ? user.userId : null;
  const queryClient = useQueryClient();

  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const [notifiedCount, setNotifiedCount] = useState<number>(0);

  const { data, refetch } = useQuery<ProductNotification[], Error>(
    ['products-notifications', userId],
    async () => {
      if (!userId) return [];
      const response = await db.ProductsNotification.list([
        Query.equal('userId', userId),
      ]);
      return response.documents.map((doc: any) => ({
        id: doc.$id,
        productId: doc.productId,
        productName: doc.productName,
        requestStatus: doc.requestStatus,
        isRead: doc.isRead,
        createdAt: doc.createdAt,
        notifiedAt: doc.notifiedAt,
      }));
    },
    {
      enabled: !!userId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!data) return;

    const processNotifications = async () => {
      for (const notification of data) {
        try {
          const productDoc = await db.Products.get(notification.productId);
          const stockQuantity = productDoc.stockQuantity;

          if (stockQuantity > 0 && notification.requestStatus === 'pending') {
            // Update to 'notified' and set notifiedAt
            await db.ProductsNotification.update(notification.id, {
              requestStatus: 'notified',
              notifiedAt: new Date().toISOString(),
            });
          } else if (stockQuantity <= 0 && notification.requestStatus === 'notified') {
            // Update to 'pending'
            await db.ProductsNotification.update(notification.id, {
              requestStatus: 'pending',
              notifiedAt: null,
            });
          }
        } catch (error) {
          console.error(`Error processing notification ${notification.id}:`, error);
        }
      }

      // Refetch after updates
      refetch();
    };

    processNotifications();
  }, [data, userId, refetch]);

  useEffect(() => {
    if (!data) return;

    // **Filter notifications to only include those with requestStatus 'notified'**
    const notifiedNotifications = data.filter(
      (notification) => notification.requestStatus === 'notified'
    );

    // Deduplicate notifications by productId
    const deduped = notifiedNotifications.reduce((acc: ProductNotification[], curr) => {
      if (!acc.some((item) => item.productId === curr.productId)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    setNotifications(deduped);

    // **Set notifiedCount based on the filtered notifications**
    const count = deduped.length;
    setNotifiedCount(count);
  }, [data]);

  return { notifications, notifiedCount, refetchNotifications: refetch, userId };
};

export default useProductsNotifications;
