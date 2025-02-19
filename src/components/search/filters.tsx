// components/search/shop-filters.tsx

import CategoryFilter from './category-filter';
import { BrandFilter } from './brand-filter';
import { FilteredItem } from './filtered-item';
import { useRouter } from 'next/router';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import { DietaryFilter } from '@components/search/dietary-filter';
import Heading from '@components/ui/heading';
import { useCategoriesQuery } from '@framework/category/get-all-categories';
import { Category } from '@framework/types';
import { useMemo } from 'react';

/**
 * Helper function to format category name
 * Removes special characters, replaces spaces with hyphens, and converts to lowercase
 */
const formatCategoryName = (name: string): string =>
  name
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except hyphen and space
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase();

export const ShopFilters: React.FC = () => {
  const router = useRouter();
  const { pathname, query } = router;
  const { t } = useTranslation('common');

  // Use the useCategoriesQuery hook to fetch categories
  const { data, isLoading, error } = useCategoriesQuery();

  // Create a mapping from category ID to category object for quick lookup
  const categoryMap = useMemo(() => {
    const map: Record<string, Category> = {};

    if (!data?.categories) return map;

    const traverse = (categories: Category[]) => {
      for (const category of categories) {
        map[category.id] = category; // Map id to the entire category object
        if (category.children && category.children.length > 0) {
          traverse(category.children);
        }
      }
    };

    traverse(data.categories);

    return map;
  }, [data]);

  // Function to get category display value by ID
  const getCategoryDisplayValue = (id: string): string => {
    if (isLoading) return t('text-loading'); // Display a loading text while categories are loading
    if (error) return id; // Fallback to ID if there's an error

    const category = categoryMap[id];
    if (!category) return id; // Fallback to ID if category not found

    // If the category has a parentId, it's a subcategory; display slug
    // Otherwise, it's a parent category; display name
    return category.parentId ? category.slug : category.name;
  };

  return (
    <div className="space-y-10">
      {!isEmpty(query) && (
        <div className="block -mb-3">
          <div className="flex items-center justify-between mb-4 -mt-1">
            <Heading>{t('text-filters')}</Heading>
            <button
              className="flex-shrink transition duration-150 ease-in text-13px focus:outline-none hover:text-brand-dark"
              aria-label={t('text-clear-all')}
              onClick={() => {
                // Remove only the 'category' parameter to stop filtering by name
                const { category, ...restQuery } = query;

                router.push(
                  {
                    pathname,
                    query: restQuery,
                  },
                  undefined,
                  { shallow: true } // Use shallow routing to prevent full page reload
                );
              }}
            >
              {t('text-clear-all')}
            </button>
          </div>
          <div className="flex flex-wrap -m-1">
            {Object.entries(query).map(([key, value]) => {
              // **Skip processing the 'name' parameter as it's only for UX**
              if (key === 'name') return null;

              // Handle both string and array values
              const values = Array.isArray(value) ? value : [value];
              return values.map((v, idx) => {
                // Type Guard: Ensure v is a string
                if (isEmpty(v) || typeof v !== 'string') return null;

                // Map category IDs to display values
                let displayValue = v;
                let itemId = v; // Default to v

                if (key === 'category') {
                  displayValue = getCategoryDisplayValue(v);
                  itemId = v; // Use the ID for removal
                }

                return (
                  <FilteredItem
                    itemKey={key}
                    itemValue={displayValue}
                    itemId={itemId}
                    key={`${key}-${idx}`}
                  />
                );
              });
            })}
          </div>
          {/* Optional: Display loading or error messages */}
          {isLoading && (
            <div className="mt-2">
              <span>{t('text-loading-categories')}</span>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-500">
              {t('text-error-loading-categories')}
            </div>
          )}
        </div>
      )}

      {/* CategoryFilter Component */}
      <CategoryFilter />
    </div>
  );
};
