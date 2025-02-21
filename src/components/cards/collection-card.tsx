// src/components/product/collection-card.tsx

import Heading from '@components/ui/heading';
import Image from '@components/ui/image';
import Link from '@components/ui/link';
import { LinkProps } from 'next/link';
import { useTranslation } from 'next-i18next';
import { collectionPlaceholder } from '@assets/placeholders';
import React, { useMemo } from 'react';

interface Props {
  imgWidth?: number | string;
  imgHeight?: number | string;
  href: LinkProps['href'];
  collection: {
    imageUrl: string; // Updated to use imageUrl from the blogs collection
    title: string;
    content: string; // Updated to use content as the description
  };
}

const CollectionCard: React.FC<Props> = ({
  collection,
  imgWidth = 440,
  imgHeight = 320,
  href,
}) => {
  const { imageUrl, title, content } = collection;
  const { t } = useTranslation('common');

  /**
   * Helper function to strip HTML tags from a string.
   * @param html - The HTML string to strip tags from.
   * @returns The plain text without HTML tags.
   */
  const stripHtml = (html: string): string => {
    if (typeof window !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    // Fallback for server-side rendering
    return html.replace(/<[^>]+>/g, '');
  };

  /**
   * Truncate the text to a specified length and append '...' if necessary.
   * @param text - The text to truncate.
   * @param maxLength - The maximum length of the truncated text.
   * @returns The truncated text.
   */
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  /**
   * Compute the truncated content using useMemo for performance optimization.
   */
  const truncatedContent = useMemo(() => {
    const plainText = stripHtml(content);
    return truncateText(plainText, 55);
  }, [content]);

  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-md group shadow-card"
    >
      <img
        src={imageUrl || collectionPlaceholder}
        alt={t(title) || t('text-card-thumbnail')}
        width={imgWidth}
        height={imgHeight}
        className="object-cover transition duration-300 ease-in-out transform bg-fill-thumbnail group-hover:opacity-90 group-hover:scale-105"
      />
      <div className="flex flex-col px-4 pt-4 pb-4 lg:px-5 xl:px-6 lg:pt-5 md:pb-5 lg:pb-6 xl:pb-7">
        <Heading
          variant="title"
          className="mb-1 lg:mb-1.5 truncate group-hover:text-brand"
        >
          {t(title)}
        </Heading>
        {/* Render the truncated content as plain text */}
        <div className="truncate text-sm text-gray-600">{truncatedContent}</div>
      </div>
    </Link>
  );
};

export default CollectionCard;
