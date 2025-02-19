import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postcode } = req.query;
  const apikey=process.env.POSTCODER_API_KEY

  if (!postcode || typeof postcode !== 'string') {
    res.status(400).json({ error: 'Invalid or missing postcode parameter' });
    return;
  }

  try {
    const response = await fetch(
      `https://ws.postcoder.com/pcw/${apikey}/address/pk/${encodeURIComponent(postcode)}?format=json&lines=3`
    );

    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch address data' });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
