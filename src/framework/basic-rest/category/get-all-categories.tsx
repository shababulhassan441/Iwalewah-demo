import { Query } from 'appwrite';
import db from 'src/appwrite/Services/dbServices';
import storageServices from 'src/appwrite/Services/storageServices';
import slugify from 'slugify';
import { Category } from '@framework/types';
import { useQuery } from 'react-query';

const limit = 25; // Set the limit per request

export const fetchCategories = async () => {
  let allCategories: Category[] = [];
  let offset = 0;
  let fetchedCategories = [];

  try {
    // Paginate through all categories
    do {
      const response = await db.Categories.list([
        Query.limit(limit),
        Query.offset(offset),
      ]);

      fetchedCategories = response.documents;

      // Process each fetched category and append it to allCategories
      for (const category of fetchedCategories) {
        let iconUrl = '/assets/placeholder/category-small.svg';

        if (category.image && category.image.length > 0) {
          try {
            const imageId = category.image[0];
            const imageUrl = await storageServices.images.getFilePreview(imageId);
            iconUrl = imageUrl.href;
          } catch (error) {
            console.error(`Error fetching image for category ${category.$id}:`, error);
          }
        }

        // Generate slug
        const slug = slugify(category.name, { lower: true });

        // Log the slug to verify correctness

        allCategories.push({
          id: category.$id,
          name: category.name,
          description: category.description,
          icon: iconUrl,
          parentId: category.parentCategoryId || null,
          children: [],
          slug: slug,
        });
      }

      offset += limit; // Increment offset to fetch the next batch
    } while (fetchedCategories.length === limit); // Continue fetching until less than 'limit' categories are returned

    // Build the nested category structure
    const categoriesMap: { [key: string]: Category } = {};

    allCategories.forEach((category) => {
      categoriesMap[category.id] = category;
    });

    const rootCategories: Category[] = [];

    for (const categoryId in categoriesMap) {
      const category = categoriesMap[categoryId];
      if (category.parentId && categoriesMap[category.parentId]) {
        categoriesMap[category.parentId].children.push(category);
      } else {
        rootCategories.push(category);
      }
    }

    return { categories: rootCategories };
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw new Error(error.message || 'Failed to fetch categories');
  }
};


/**
 * Custom hook to use categories with React Query.
 */
export const useCategoriesQuery = () => {
  return useQuery<{ categories: Category[] }, Error>(
    'categories',
    fetchCategories,
    {
      staleTime: 0, // Set to 0 to always consider data stale
      cacheTime: 1000 * 60 * 5, // Reduced to 5 minutes
      retry: 2, // Increased retry attempts
      
    }
  );
};
