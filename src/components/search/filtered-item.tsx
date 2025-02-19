// components/search/filtered-item.tsx

import { useRouter } from 'next/router';
import { IoClose } from 'react-icons/io5';
import isEmpty from 'lodash/isEmpty';

interface Props {
  itemKey: string;
  itemValue: string; // Display name
  itemId: string; // Actual ID to remove
}

export const FilteredItem: React.FC<Props> = ({
  itemKey,
  itemValue,
  itemId,
}) => {
  const router = useRouter();
  const { pathname, query } = router;

  function handleClose() {
    const currentItems = (query[itemKey] as string)
      .split(',')
      .filter((i) => i !== itemId);
    const updatedQuery = { ...query };

    // Remove 'name' parameter if 'category' is removed
    if (itemKey === 'category' && !currentItems.length) {
      delete updatedQuery['name']; // Automatically remove the 'name' parameter
    }

    if (currentItems.length > 0) {
      updatedQuery[itemKey] = currentItems.join(',');
    } else {
      delete updatedQuery[itemKey];
    }

    router.push({
      pathname,
      query: updatedQuery,
    });
  }

  return (
    <div
      className="group flex shrink-0 m-1 items-center border border-border-base rounded-lg text-13px px-2.5 py-1.5 capitalize text-brand-dark cursor-pointer transition duration-200 ease-in-out hover:border-brand"
      onClick={handleClose}
    >
      {itemValue}
      <IoClose className="text-sm text-body ltr:ml-2 rtl:mr-2 shrink-0 ltr:-mr-0.5 rtl:-ml-0.5 mt-0.5 transition duration-200 ease-in-out group-hover:text-heading" />
    </div>
  );
};
