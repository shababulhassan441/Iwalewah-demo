// pages/api/verify-recaptcha.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const verifyRecaptcha = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ success: false, message: 'reCAPTCHA secret key not configured' });
  }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {},
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;

    if (data.success) { // For v2
      return res.status(200).json({ success: true, data });
    } else {
      return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed', data });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ success: false, message: 'reCAPTCHA verification error' });
  }
};

export default verifyRecaptcha;
