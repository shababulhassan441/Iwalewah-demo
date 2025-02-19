// pages/api/distance.ts

import type { NextApiRequest, NextApiResponse } from 'next';

const DISTANCE_MATRIX_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Your fixed location
const FIXED_LOCATION = 'W12 0HQ';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin } = req.query;

  if (!origin || typeof origin !== 'string') {
    return res.status(400).json({ error: 'Origin is required' });
  }

  try {
    const response = await fetch(
      `${DISTANCE_MATRIX_API_URL}?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(
        FIXED_LOCATION
      )}&units=imperial&key=${GOOGLE_API_KEY}`
    );
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ error: data.status });
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      return res.status(400).json({ error: element.status });
    }

    res.status(200).json({
      distanceText: element.distance.text,
      distanceValue: element.distance.value, // in meters
      durationText: element.duration.text,
      durationValue: element.duration.value, // in seconds
    });
  } catch (error) {
    console.error('Distance Matrix API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
