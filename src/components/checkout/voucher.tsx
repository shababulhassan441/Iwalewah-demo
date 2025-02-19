// components/Voucher.tsx

import React, { useState } from 'react';
import Button from '@components/ui/button';
import axios from 'axios';
import { useAuth } from 'src/hooks/useAuth';
import Spinner from '@components/spinner';

interface VoucherProps {
  onApply: (
    discountCode: string,
    discountAmount: number,
    voucherId: string
  ) => void;
}

const Voucher: React.FC<VoucherProps> = ({ onApply }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user ? user.userId : null;

  const [discountCode, setDiscountCode] = useState<string>('');
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const handleApply = async () => {
    if (!discountCode) {
      setMessage({ type: 'error', text: 'Please enter a discount code' });
      return;
    }

    if (!userId) {
      setMessage({
        type: 'error',
        text: 'You need to be logged in to apply a discount code',
      });
      return;
    }

    setIsApplying(true);
    setMessage(null);

    try {
      // Step 1: Validate the voucher code
      const voucherResponse = await axios.post('/api/validate-discount', {
        code: discountCode,
      });

      const {
        isValid,
        discountValue,
        voucherId,
        message: voucherMessage,
      } = voucherResponse.data;

      if (!isValid) {
        setMessage({
          type: 'error',
          text: voucherMessage || 'Invalid discount code',
        });
        setIsApplying(false);
        return;
      }

      // Step 2: Check if the user has already used this voucher
      const userVoucherResponse = await axios.post('/api/check-user-voucher', {
        userId,
        voucherId,
      });

      const { hasUsed } = userVoucherResponse.data;

      if (hasUsed) {
        setMessage({
          type: 'error',
          text: 'You have already used this discount code',
        });
        setIsApplying(false);
        return;
      }

      // Step 3: Apply the discount
      onApply(discountCode, discountValue, voucherId);
      setMessage({ type: 'success', text: 'Discount applied' });
    } catch (error: any) {
      console.error('Error applying discount code:', error);
      setMessage({ type: 'error', text: 'Error applying discount code' });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col mt-4">
      {/* Display Success or Error Message */}
      {message && (
        <div
          className={`mb-2 text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Discount Code Input and Apply Button */}
      <div className="flex">
        <input
          type="text"
          className="flex-1 px-3 py-2 border rounded-md text-black"
          placeholder="Enter discount code"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value)}
          disabled={isApplying}
        />
        <Button
          onClick={handleApply}
          className="ml-2 flex items-center justify-center px-4 py-2"
          disabled={isApplying}
          style={{ minWidth: '100px' }} // Ensures consistent width
        >
          {isApplying ? <Spinner /> : 'Apply'}
        </Button>
      </div>
    </div>
  );
};

export default Voucher;
