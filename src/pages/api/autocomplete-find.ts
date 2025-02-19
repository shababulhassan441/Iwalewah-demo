// pages/api/autocompleteFind.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const POSTCODER_FIND_URL = 'https://ws.postcoder.com/pcw/autocomplete/find';
const API_KEY = process.env.POSTCODER_API_KEY; // Ensure you add your API key to .env.local

export default async function autocompleteFind(req: NextApiRequest, res: NextApiResponse) {
  const { query, country } = req.query;

  if (!query || typeof query !== 'string' || query.length < 3) {
    return res.status(400).json({ error: 'Query parameter must be at least 3 characters long.' });
  }

  if (!country || typeof country !== 'string') {
    return res.status(400).json({ error: 'Country parameter is required and must be a string.' });
  }

  try {
    const response = await axios.get(POSTCODER_FIND_URL, {
      params: {
        query,
        country: country.toLowerCase(), // Ensure country code is lowercase
        apikey: API_KEY,
        singlesummary: true,
        format: 'json',
        maximumresults: 10, // Adjust as needed
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching autocomplete suggestions:', error.message);
    return res.status(500).json({ error: `Failed to fetch autocomplete suggestions ${error}` });
  }
}
