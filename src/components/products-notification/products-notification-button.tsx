// src/components/notification/notification-button.tsx

import { IoNotificationsOutline } from 'react-icons/io5';
import { useUI } from '@contexts/ui.context';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import useProductsNotifications from '@framework/products-notification/useProductsNotifications';

type ProductsNotificationButtonProps = {
  className?: string;
  iconClassName?: string;
  hideLabel?: boolean;
  isShowing?: boolean;
};

const ProductsNotificationButton: React.FC<ProductsNotificationButtonProps> = ({
  className,
  iconClassName = 'text-white  text-2xl', // Adjust size here
  hideLabel,
  isShowing,
}) => {
  const { t } = useTranslation('common');
  const { openDrawer, setDrawerView } = useUI();

  const { notifiedCount } = useProductsNotifications();

  function handleNotificationOpen() {
    setDrawerView('PRODUCTS_NOTIFICATION_SIDEBAR');
    openDrawer();
  }

  return (
    <button
      className={cn(
        'flex items-center justify-center shrink-0 h-auto focus:outline-none transform',
        className
      )}
      onClick={handleNotificationOpen}
      aria-label="notification-button"
    >
      <div className="relative flex items-center">
        <IoNotificationsOutline className={cn(iconClassName)} />
        <span className="min-w-[20px] min-h-[20px] p-0.5 rounded-full flex items-center justify-center bg-brand text-brand-light absolute -top-2.5 ltr:left-2.5 rtl:right-2.5 text-10px font-bold">
          {notifiedCount}
        </span>
      </div>
      {!hideLabel && (
        <span className="text-sm font-normal lg:text-15px text-white ltr:ml-2 rtl:mr-2">
          {t('text-notifications')}
        </span>
      )}
    </button>
  );
};

export default ProductsNotificationButton;
