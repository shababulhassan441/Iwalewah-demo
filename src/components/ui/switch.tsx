// components/ui/switch.tsx

import { Switch as HeadlessSwitch } from '@headlessui/react';
import React, { forwardRef } from 'react';
import cn from 'classnames';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onChange, className, ...props }, ref) => (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      ref={ref} // Forward the ref to HeadlessSwitch
      className={cn(
        className,
        'relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      )}
      {...props}
    >
      <span
        className={cn(
          checked ? 'translate-x-6' : 'translate-x-1',
          'inline-block w-4 h-4 transform bg-white rounded-full transition-transform'
        )}
      />
    </HeadlessSwitch>
  )
);

Switch.displayName = 'Switch'; // Optional: Helps with debugging and React DevTools

export default Switch;
