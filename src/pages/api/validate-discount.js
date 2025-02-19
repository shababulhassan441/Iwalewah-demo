// pages/api/validate-discount.js

import db from '../../appwrite/Services/dbServices';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ isValid: false, message: 'No code provided' });
    }

    try {
      // Fetch the voucher by code
      const response = await db.Vouchers.list([
        Query.equal('code', code),
        Query.limit(1),
      ]);

      if (response.documents.length === 0) {
        return res
          .status(200)
          .json({ isValid: false, message: 'Invalid discount code' });
      }

      const voucher = response.documents[0];

      // Check if the voucher has expired
      const currentDate = new Date();
      const expiryDate = new Date(voucher.expiryDate);

      if (currentDate > expiryDate) {
        return res.status(200).json({
          isValid: false,
          message: 'This voucher has expired',
        });
      }

      return res.status(200).json({
        isValid: true,
        discountValue: voucher.discountValue,
        voucherId: voucher.$id,
      });
    } catch (error) {
      console.error('Error validating discount code:', error);
      return res
        .status(500)
        .json({ isValid: false, message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
