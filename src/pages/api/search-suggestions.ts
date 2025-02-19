// pages/api/search-suggestions.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import db from 'src/appwrite/Services/dbServices'; // Adjust the import path as necessary
import { Query } from 'appwrite';

interface Suggestion {
  id: string;
  name: string;
  // Add other fields if necessary
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter.' });
  }

  try {
    // Fetch products where 'name' starts with the query string
    // Adjust the query based on your requirements and Appwrite's capabilities
    const response = await db.Products.list([
      Query.search('name', q), // Ensure 'name' has a full-text index
      Query.limit(5), // Limit to top 5 suggestions
      Query.orderAsc('name'),
    ]);

    const suggestions: Suggestion[] = response.documents.map((product: any) => ({
      id: product.$id,
      name: product.name,
    }));

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
