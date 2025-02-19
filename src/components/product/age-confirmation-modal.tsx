// src/components/ui/AgeConfirmationModal.tsx

import React from 'react';
import Button from '@components/ui/button';
import Heading from '@components/ui/heading';
import Text from '@components/ui/text';
import { useTranslation } from 'next-i18next';

interface AgeConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const AgeConfirmationModal: React.FC<AgeConfirmationModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-28">
      <div className="bg-white p-6 rounded-md shadow-lg  max-w-lg w-full">
        <Heading className="mb-4">CONFIRM YOUR AGE TO CONTINUE.</Heading>
        <Text className="mb-6">
          Upon delivery, if you appear under 25, you will be asked to provide a
          valid ID, such as a driving licence, passport, or proof of age card,
          to confirm you are over 18. If you cannot provide ID, any
          age-restricted items will be removed from your order, and you will not
          be charged for them. To proceed, please confirm that you are over 18.
        </Text>
        <div className="flex justify-end space-x-4 mt-2">
          <Button variant="border" onClick={onCancel}>
            I am under 18
          </Button>
          <Button onClick={onConfirm}>I confirm I am over 18</Button>
        </div>
      </div>
    </div>
  );
};

export default AgeConfirmationModal;
