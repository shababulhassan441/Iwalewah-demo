// src/components/notification/notifications.tsx

import React, { useState } from 'react';
import { IoClose, IoReloadOutline } from 'react-icons/io5'; // Import loader icon
import { useUI } from '@contexts/ui.context';
import Scrollbar from '@components/ui/scrollbar';
import { useTranslation } from 'next-i18next';
import Heading from '@components/ui/heading';
import Text from '@components/ui/text';
import cn from 'classnames';
import Link from '@components/ui/link';
import useProductsNotifications from '@framework/products-notification/useProductsNotifications';
import db from 'src/appwrite/Services/dbServices';
import { Query } from 'appwrite';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toast } from 'react-toastify';

dayjs.extend(relativeTime);

const ProductsNotifications: React.FC = () => {
  const { closeDrawer } = useUI();
  const { notifications, refetchNotifications, userId } =
    useProductsNotifications();
  const { t } = useTranslation('common');

  // State to track which productIds are being removed
  const [removingNotifications, setRemovingNotifications] = useState<string[]>(
    []
  );

  const handleRemove = async (productId: string) => {
    try {
      if (!userId || !productId) return;

      // Add productId to removingNotifications
      setRemovingNotifications((prev) => [...prev, productId]);

      // Fetch all notifications for this user and productId
      const notificationsList = await db.ProductsNotification.list([
        Query.equal('userId', userId),
        Query.equal('productId', productId),
      ]);

      // Delete each notification document
      const deletePromises = notificationsList.documents.map((doc: any) =>
        db.ProductsNotification.delete(doc.$id)
      );

      await Promise.all(deletePromises);

      // Refetch notifications
      await refetchNotifications();

      // Remove productId from removingNotifications
      setRemovingNotifications((prev) => prev.filter((id) => id !== productId));

      toast('Notifications removed.', { autoClose: 2000 });
    } catch (error) {
      console.error('Error removing notifications:', error);
      toast(t('common:text-error'), { autoClose: 1500 });

      // Ensure the productId is removed from removingNotifications in case of error
      setRemovingNotifications((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border-base">
        <Heading variant="titleMedium">Notifications</Heading>
        <button
          className="flex items-center justify-center p-2 text-2xl text-brand-dark hover:text-brand"
          onClick={closeDrawer}
          aria-label="close-notifications"
        >
          <IoClose />
        </button>
      </div>

      {/* Notifications List */}
      <Scrollbar className="flex-grow p-5">
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const isRemoving = removingNotifications.includes(
              notification.productId
            );

            return (
              <div
                key={notification.id}
                className="mb-4 p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <Heading variant="title" className="mb-1">
                    Back in Stock
                  </Heading>
                  <button
                    className={cn(
                      'flex items-center text-sm text-red-500 hover:underline focus:outline-none',
                      { 'cursor-not-allowed opacity-50': isRemoving }
                    )}
                    onClick={() => handleRemove(notification.productId)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <>
                        <IoReloadOutline className="animate-spin mr-1" />
                        Removing...
                      </>
                    ) : (
                      'Remove'
                    )}
                  </button>
                </div>
                <Link
                  href={`/products/${notification.productId}`}
                  className="text-brand hover:underline"
                >
                  {notification.productName}
                </Link>
                <Text variant="small" className="text-gray-500 mt-2">
                  {notification.notifiedAt
                    ? dayjs(notification.notifiedAt).fromNow()
                    : ''}
                </Text>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Text variant="small">No Notifications</Text>
          </div>
        )}
      </Scrollbar>
    </div>
  );
};

export default ProductsNotifications;
