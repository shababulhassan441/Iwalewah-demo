// src/settings/site-settings.ts

import { ILFlag } from '@components/icons/language/ILFlag';
import { SAFlag } from '@components/icons/language/SAFlag';
import { CNFlag } from '@components/icons/language/CNFlag';
import { USFlag } from '@components/icons/language/USFlag';
import { DEFlag } from '@components/icons/language/DEFlag';
import { ESFlag } from '@components/icons/language/ESFlag';
import React from 'react'; // Necessary for JSX in languageMenu

// Define the MenuItem interface
interface MenuItem {
  id: number | string;
  path: string;
  label: string;
  requiresApproval?: boolean;
  subMenu?: MenuItem[]; // Optional subMenu
}

export const siteSettings = {
  name: 'Iwalewah',
  description: 'Best Grocery store ever',
  author: {
    name: 'iwalewah',
    websiteUrl: '#',
    address: '',
  },
  adminUrl: 'https://admin.iwalewah.co.uk/',
  logo: {
    url: '/assets/images/White-Logo-Purplebg.png',
    alt: 'Walewah',
    href: '/',
    width: 100,
    height: 80,
  },
  purpleLogo: {
    url: '/assets/images/Purple-Logo-Nobg.png',
    alt: 'Walewah',
    href: '/',
    width: 130,
    height: 120,
  },
  defaultLanguage: 'en',
  currencyCode: 'GBP',
  site_header: {
    menu: [
      {
        id: 1,
        path: '/',
        label: 'Home',
      },
      {
        id: 2,
        path: '/search',
        label: 'menu-categories',
      },
      {
        id: 3,
        path: '/about-us',
        label: 'menu-about-us',
      },
      {
        id: 4,
        path: '/contact-us',
        label: 'menu-contact-us',
      },
      // Uncomment and define subMenu if needed
      // {
      //   id: 6,
      //   path: '/',
      //   label: 'menu-pages',
      //   subMenu: [
      //     {
      //       id: 4,
      //       path: '/privacy',
      //       label: 'menu-privacy-policy',
      //     },
      //     {
      //       id: 5,
      //       path: '/terms',
      //       label: 'menu-terms-condition',
      //     },
      //   ],
      // },
      {
        id: 9,
        path: '/wholesale',
        label: 'Wholesale',
        requiresApproval: true, // Added for conditional visibility
      },
    ] as MenuItem[], // Type assertion
    mobileMenu: [
      {
        id: 1,
        path: '/',
        label: 'Home',
      },
      {
        id: 2,
        path: '/search',
        label: 'menu-categories',
      },
      {
        id: 3,
        path: '/about-us',
        label: 'menu-about-us',
      },
      {
        id: 4,
        path: '/contact-us',
        label: 'menu-contact-us',
      },
      // Uncomment and define subMenu if needed
      // {
      //   id: 6,
      //   path: '/',
      //   label: 'menu-pages',
      //   subMenu: [
      //     {
      //       id: 4,
      //       path: '/privacy',
      //       label: 'menu-privacy-policy',
      //     },
      //     {
      //       id: 5,
      //       path: '/terms',
      //       label: 'menu-terms-condition',
      //     },
      //   ],
      // },
      {
        id: 9,
        path: '/wholesale',
        label: 'Wholesale',
        requiresApproval: true, // Added for conditional visibility
      },
    ] as MenuItem[], // Type assertion
    languageMenu: [
      {
        id: 'ar',
        name: 'عربى - AR',
        value: 'ar',
        icon: <SAFlag />,
      },
      {
        id: 'zh',
        name: '中国人 - ZH',
        value: 'zh',
        icon: <CNFlag />,
      },
      {
        id: 'en',
        name: 'English - EN',
        value: 'en',
        icon: <USFlag />,
      },
      {
        id: 'de',
        name: 'Deutsch - DE',
        value: 'de',
        icon: <DEFlag />,
      },
      // Uncomment if needed
      // {
      //   id: 'he',
      //   name: 'עברית - HE',
      //   value: 'he',
      //   icon: <ILFlag />,
      // },
      {
        id: 'es',
        name: 'Español - ES',
        value: 'es',
        icon: <ESFlag />,
      },
    ],
  },
};
