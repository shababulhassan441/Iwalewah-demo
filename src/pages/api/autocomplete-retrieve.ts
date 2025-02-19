// pages/api/autocompleteRetrieve.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const POSTCODER_RETRIEVE_URL = 'https://ws.postcoder.com/pcw/autocomplete/retrieve/';
const API_KEY = process.env.POSTCODER_API_KEY; // Ensure you add your API key to .env.local

export default async function autocompleteRetrieve(req: NextApiRequest, res: NextApiResponse) {
  const { id, query, country } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID parameter is required and must be a string.' });
  }

  if (!country || typeof country !== 'string') {
    return res.status(400).json({ error: 'Country parameter is required and must be a string.' });
  }

  try {
    const response = await axios.get(POSTCODER_RETRIEVE_URL, {
      params: {
        id,
        query,
        country: country.toLowerCase(), // Ensure country code is lowercase
        apikey: API_KEY,
        format: 'json',
        lines: 5, // Number of address lines to retrieve
      },
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching full address:', error.message);
    return res.status(500).json({ error: 'Failed to fetch full address.' });
  }
}
