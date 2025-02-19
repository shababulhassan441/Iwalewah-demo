// src/components/layout/header/header-two.tsx

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
import useOnClickOutside from '@utils/use-click-outside';

// Dynamic Imports
const AuthMenu: any = dynamic(() => import('./auth-menu'), { ssr: false });
const CartButton: any = dynamic(() => import('@components/cart/cart-button'), {
  ssr: false,
});
const ProductsNotificationButton: any = dynamic(
  () =>
    import('@components/products-notification/products-notification-button'),
  {
    ssr: false,
  }
);

type DivElementRef = React.MutableRefObject<HTMLDivElement>;

interface CategoriesProps {
  className?: string;
}

const Header: React.FC = () => {
  const { t } = useTranslation('common');
  const { site_header } = siteSettings;
  const { openSidebar, isAuthorized, displaySearch, closeSearch } = useUI();
  const { openModal } = useModalAction();
  const siteHeaderRef = useRef() as DivElementRef;
  const siteSearchRef = useRef() as DivElementRef;

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
  useActiveScroll(siteHeaderRef, 40);

  // Handle click outside for search
  useOnClickOutside(siteSearchRef, () => closeSearch());

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
              .toLowerCase()}&category=${category.id}`, // Format the name and id
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

    // **Remove Conditional Wholesale Menu Item Logic**
    // Ensure Wholesale menu item is always included

    // Find the Wholesale menu item
    const wholesaleMenuItem = site_header.menu.find(
      (item: any) => item.id === 9
    );

    if (wholesaleMenuItem) {
      const isWholesaleIncluded = updatedMenu.some(
        (item: any) => item.id === 9
      );
      if (!isWholesaleIncluded) {
        updatedMenu.push(wholesaleMenuItem);
      }
    }

    setFilteredMenu(updatedMenu);
  }, [data, site_header.menu]);

  function handleLogin() {
    openModal('LOGIN_VIEW');
  }

  function handleMobileMenu() {
    return openSidebar();
  }

  if (userLoading || categoriesLoading) {
    // Optionally, return a minimal header or a loader while categories or user data is loading
    return null;
  }

  return (
    <header
      id="siteHeader"
      ref={siteHeaderRef}
      className={cn(
        'header-two sticky-header sticky top-0 z-20 lg:relative w-full h-16 lg:h-auto'
        // Add other classes or conditions if necessary
      )}
    >
      <div className="z-20 w-screen transition-all duration-200 ease-in-out innerSticky lg:w-full body-font bg-[#260f47]">
        <Search
          searchId="mobile-search"
          className="hidden lg:max-w-[600px] absolute z-30 px-4 md:px-6 top-1 cursor-pointer"
        />
        {/* Added cursor-pointer to Search */}

        {/* End of Mobile search */}
        <Container className="flex items-center justify-between h-16 py-3 top-bar lg:h-auto">
          <Logo className="logo -mt-1.5 md:-mt-1 cursor-pointer" />
          {/* Added cursor-pointer to Logo */}

          <Search
            searchId="top-bar-search"
            className="hidden lg:flex lg:max-w-[650px] 2xl:max-w-[800px] lg:ltr:ml-7 lg:rtl:mr-7 lg:ltr:mr-5 lg:rtl:ml-5 cursor-pointer"
          />
          {/* Added cursor-pointer to Search */}

          <div className="flex shrink-0 -mx-2.5 xl:-mx-3.5">
            <div className="xl:mx-3.5 mx-2.5 cursor-pointer">
              <LanguageSwitcher />
            </div>
            <ProductsNotificationButton className="hidden lg:flex mx-2.5 xl:mx-3.5 cursor-pointer" />
            <CartButton className="hidden lg:flex mx-2.5 xl:mx-3.5 cursor-pointer" />
            <div className="items-center hidden lg:flex shrink-0 xl:mx-3.5 mx-2.5 cursor-pointer">
              <UserIcon className="text-brand-dark text-opacity-40 cursor-pointer" />
              <AuthMenu
                isAuthorized={isAuthorized}
                btnProps={{
                  onClick: handleLogin,
                }}
              />
            </div>
          </div>
        </Container>
        {/* End of top part */}

        <div className="hidden navbar bg-[#260f47] lg:block">
          <Container className="flex items-center justify-between h-16">
            <Logo className="w-0 transition-all duration-200 ease-in-out opacity-0 navbar-logo cursor-pointer" />
            {/* Added cursor-pointer to Logo */}

            <HeaderMenu
              data={filteredMenu}
              className="flex transition-all duration-200 ease-in-out cursor-pointer"
            />
            {/* Added cursor-pointer to HeaderMenu */}

            {displaySearch && (
              <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full px-4 sticky-search">
                <Search
                  ref={siteSearchRef}
                  className="max-w-[780px] xl:max-w-[830px] 2xl:max-w-[1000px] cursor-pointer"
                />
              </div>
            )}
            {/* End of conditional search */}
          </Container>
        </div>
        {/* End of menu part */}
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
