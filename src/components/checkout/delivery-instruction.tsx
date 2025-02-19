import React from 'react';
import TextArea from '@components/ui/form/text-area';
import { useCheckout } from './checkout-context';

const DeliveryInstructions: React.FC = () => {
  const { deliveryInstructions, setDeliveryInstructions } = useCheckout();

  return (
    <div className="w-full max-w-[1300px] mx-auto">
      <div className="flex flex-wrap">
        <div className="w-full">
          <div className="rounded min-h-[112px] h-full mt-4">
            <TextArea
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              variant="normal"
              inputClassName="focus:border-2 focus:outline-none focus:border-brand"
              label="forms:label-delivery-instructions-note"
              name={''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInstructions;
