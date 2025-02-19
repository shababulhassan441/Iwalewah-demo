// src/components/order/action-button.tsx

import { useUI } from '@contexts/ui.context';

const ActionsButton: React.FC<{ item?: any }> = ({ item }) => {
  const { openDrawer, setDrawerView } = useUI();

  function handleCartOpen(item: any) {
    setDrawerView('ORDER_DETAILS');
    return openDrawer(item);
  }

  return (
    <div className="relative actions_button_group">
      <button
        onClick={() => handleCartOpen(item)}
        className="px-2 py-1 border border-gray-400 text-black rounded-md hover:bg-brand hover:text-white transition-all focus:outline-none"
      >
        Order Details
      </button>
    </div>
  );
};

export default ActionsButton;
