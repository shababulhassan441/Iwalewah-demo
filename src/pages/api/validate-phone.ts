import type { NextApiRequest, NextApiResponse } from 'next';

const validatePhone = async (req: NextApiRequest, res: NextApiResponse) => {
  const { phoneNumber, country = 'gb' } = req.query; // Default to 'gb' if no country is provided
  const apiKey = process.env.POSTCODER_API_KEY;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const response = await fetch(`https://ws.postcoder.com/pcw/${apiKey}/mobile/${encodeURIComponent(phoneNumber as string)}?format=json&country=${country}`);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text(); // Fallback to plain text if not JSON
      throw new Error(`Unexpected response format: ${data}`);
    }

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: data });
    }
  } catch (error) {
    res.status(500).json({ error: `Error validating phone number: ${error}` });
  }
};

export default validatePhone;
