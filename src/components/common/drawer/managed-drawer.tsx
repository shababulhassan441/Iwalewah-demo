// src/components/common/drawer/managed-drawer.tsx

import dynamic from 'next/dynamic';
import { useUI } from '@contexts/ui.context';
import { Drawer } from '@components/common/drawer/drawer';
import { useRouter } from 'next/router';
import { getDirection } from '@utils/get-direction';

// Dynamic Imports
const Cart: any = dynamic(() => import('@components/cart/cart'), {
  ssr: false,
});
const OrderDetails: any = dynamic(
  () => import('@components/order/order-drawer'),
  { ssr: false }
);
const ProductsNotifications: any = dynamic(
  () => import('@components/products-notification/products-notifications'),
  { ssr: false }
);

const ManagedDrawer = () => {
  const { displayDrawer, closeDrawer, drawerView } = useUI();
  const { locale } = useRouter();
  const dir = getDirection(locale);
  const contentWrapperCSS = dir === 'ltr' ? { right: 0 } : { left: 0 };

  return (
    <Drawer
      open={displayDrawer}
      placement={dir === 'rtl' ? 'left' : 'right'}
      onClose={closeDrawer}
      handler={false}
      showMask={true}
      level={null}
      contentWrapperStyle={contentWrapperCSS}
    >
      {drawerView === 'CART_SIDEBAR' && <Cart />}
      {drawerView === 'ORDER_DETAILS' && <OrderDetails />}
      {drawerView === 'PRODUCTS_NOTIFICATION_SIDEBAR' && (
        <ProductsNotifications />
      )}
    </Drawer>
  );
};

export default ManagedDrawer;
