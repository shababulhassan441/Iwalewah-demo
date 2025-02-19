// src/components/layout/header/header.tsx

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { siteSettings } from '@settings/site-settings';
import { useUI } from '@contexts/ui.context';
import { useActiveScroll } from '@utils/add-active-scroll';
import Container from '@components/ui/container';
import Logo from '@components/ui/logo';
import UserIcon from '@components/icons/user-icon';
import MenuIcon from '@components/icons/menu-icon';
import HeaderMenu from '@components/layout/header/header-menu';
import LanguageSwitcher from '@components/ui/language-switcher';
import { useModalAction } from '@components/common/modal/modal.context';
import cn from 'classnames';
import Search from '@components/common/search';
import { useUser } from '@contexts/user.context'; // Import the UserContext
import { useCategoriesQuery } from '@framework/category/get-all-categories';
import { Category } from '@framework/types';

// Dynamic Imports
const AuthMenu: any = dynamic(() => import('./auth-menu'), { ssr: false });
const CartButton: any = dynamic(() => import('@components/cart/cart-button'), {
  ssr: false,
});
const ProductsNotificationButton: any = dynamic(
  () =>
    import('@components/products-notification/products-notification-button'),
  { ssr: false }
);

type DivElementRef = React.MutableRefObject<HTMLDivElement>;

const Header: React.FC = () => {
  const { site_header } = siteSettings;
  const { openSidebar, isAuthorized } = useUI();
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');
  const siteHeaderRef = useRef() as DivElementRef;

  // Use the UserContext
  const { user, loading: userLoading } = useUser();

  // Fetch categories using useCategoriesQuery
  const {
    data,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesQuery();

  // State to hold the filtered menu
  const [filteredMenu, setFilteredMenu] = useState(site_header.menu);

  // Use the custom hook to handle scrolling effect
  useActiveScroll(siteHeaderRef);

  useEffect(() => {
    let updatedMenu = [...site_header.menu];

    // Integrate fetched categories into the 'menu-categories' menu item
    if (data && data.categories) {
      const categoriesMenuItemIndex = updatedMenu.findIndex(
        (item: any) => item.label === 'menu-categories'
      );

      if (categoriesMenuItemIndex !== -1) {
        const categoriesMenuItem = updatedMenu[categoriesMenuItemIndex];

        // Recursive function to map categories and their subcategories
        const mapCategories: any = (categories: Category[]): any[] => {
          return categories.map((category) => ({
            id: category.id,
            label: category.name,
            path: `/search?name=${category.name
              .replace(/\s+/g, '-')
              .toLowerCase()}&category=${category.id}`, // Adjust the path as needed
            subMenu:
              category.children && category.children.length > 0
                ? mapCategories(category.children)
                : null,
          }));
        };

        // Assign the mapped categories as subMenu to the 'menu-categories' item
        updatedMenu[categoriesMenuItemIndex] = {
          ...categoriesMenuItem,
          subMenu: mapCategories(data.categories),
        };
      }
    }

    // Removed the conditional Wholesale menu item logic to always show it

    setFilteredMenu(updatedMenu);
  }, [data, site_header.menu]);

  function handleLogin() {
    openModal('LOGIN_VIEW');
  }

  function handleMobileMenu() {
    return openSidebar();
  }

  if (categoriesLoading || userLoading) {
    // Optionally, return a minimal header or a loader while categories or user data is loading
    return null;
  }

  return (
    <header
      id="siteHeader"
      ref={siteHeaderRef}
      className="w-full h-16 sm:h-20 lg:h-24 relative z-20"
    >
      <div className="innerSticky text-gray-700 body-font fixed bg-[#260f47] w-full h-20 sm:h-20 lg:h-24 z-20 ps-4 md:ps-0 lg:ps-6 pe-4 lg:pe-6 transition duration-200 ease-in-out">
        <div className="flex items-center justify-center mx-auto max-w-[1920px] h-full w-full">
          <Container className="flex items-center justify-between w-full h-full  ">
            <div className="flex items-center justify-center h-full ml-[-13px]">
              <Logo className="logo-size" />
            </div>
            <div className="flex shrink-0">
              <button
                aria-label="Menu"
                className="flex-col items-center justify-center hidden outline-none menuBtn ltr:mr-5 rtl:ml-5 lg:flex xl:hidden shrink-0 focus:outline-none"
                onClick={handleMobileMenu}
              >
                <MenuIcon />
              </button>
            </div>
            <HeaderMenu
              data={filteredMenu}
              className="hidden xl:flex md:ltr:pl-6 md:rtl:pr-6 xl:ltr:pl-10 xl:rtl:pr-10"
            />
            <div className="flex shrink-0 -mx-2.5 xl:-mx-3.5">
              <div className="xl:mx-3.5 mx-2.5">
                <LanguageSwitcher />
              </div>
              {/* Add Notification Button here */}
              <ProductsNotificationButton className="hidden lg:flex xl:mx-3.5 mx-2.5" />
              <CartButton className="hidden lg:flex xl:mx-3.5 mx-2.5" />
              <div className="items-center hidden lg:flex shrink-0 xl:mx-3.5 mx-2.5">
                <UserIcon className="text-brand-dark text-opacity-40" />
                <AuthMenu
                  isAuthorized={isAuthorized}
                  btnProps={{
                    onClick: handleLogin,
                  }}
                />
              </div>
            </div>
          </Container>
        </div>
      </div>
      {/* Optionally, handle category loading or error messages */}
      {categoriesLoading && (
        <div className="absolute z-30 w-full bg-white shadow">
          <span>{t('text-loading-categories')}</span>
        </div>
      )}
      {categoriesError && (
        <div className="absolute z-30 w-full bg-white shadow text-red-500">
          {t('text-error-loading-categories')}
        </div>
      )}
    </header>
  );
};

export default Header;
