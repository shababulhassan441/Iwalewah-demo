// pages/api/check-user-voucher.js

import db from '../../appwrite/Services/dbServices';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, voucherId } = req.body;

    if (!userId || !voucherId) {
      return res.status(400).json({ hasUsed: false });
    }

    try {
      // Fetch user vouchers for this user and voucherId
      const response = await db.UserVouchers.list([
        Query.equal('userId', userId),
        Query.equal('voucherId', voucherId),
        Query.equal('isUsed', true),
      ]);

      if (response.documents.length === 0) {
        return res.status(200).json({ hasUsed: false });
      }

      return res.status(200).json({ hasUsed: true });
    } catch (error) {
      console.error('Error checking user voucher:', error);
      return res.status(500).json({ hasUsed: false });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
