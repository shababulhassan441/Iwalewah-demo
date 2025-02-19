import type { NextApiRequest, NextApiResponse } from 'next';

const validateEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email } = req.query;
  const apiKey = process.env.POSTCODER_API_KEY;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await fetch(`https://ws.postcoder.com/pcw/${apiKey}/email/${encodeURIComponent(email as string)}?format=json`);

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ error: responseText });
    }

    try {
      const data = JSON.parse(responseText);
      return res.status(200).json(data);
    } catch (jsonError) {
      return res.status(500).json({ error: 'Invalid JSON response from Postcoder API' });
    }
  } catch (error) {
    return res.status(500).json({ error: `Error validating email ${error}` });
  }
};

export default validateEmail;
