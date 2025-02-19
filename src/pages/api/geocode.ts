// pages/api/geocode.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const response = await fetch(
      `${GEOCODING_API_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ error: data.status });
    }

    const location = data.results[0].geometry.location;
    res.status(200).json({ lat: location.lat, lng: location.lng });
  } catch (error) {
    console.error('Geocoding API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
