import { useRouter } from 'next/router';
import cn from 'classnames';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { useUI } from '@contexts/ui.context';
import { useEffect, useMemo, useState } from 'react';
import Image from '@components/ui/image';
import { useTranslation } from 'next-i18next';
import { FaCheck } from 'react-icons/fa';
import { Category } from '@framework/types';

interface CategoryFilterMenuProps {
  items: Category[];
  className?: string;
}

interface CategoryFilterMenuItemProps {
  className?: string;
  item: Category;
  depth?: number;
}

const CategoryFilterMenu: React.FC<CategoryFilterMenuProps> = ({
  items,
  className,
}) => {
  return (
    <ul className={cn(className)}>
      {items.map((item: Category) => (
        <CategoryFilterMenuItem key={item.id} item={item} />
      ))}
    </ul>
  );
};

const CategoryFilterMenuItem: React.FC<CategoryFilterMenuItemProps> = ({
  className = 'hover:bg-fill-base border-t border-border-base first:border-t-0 px-3.5 2xl:px-4 py-3 xl:py-3.5 2xl:py-2.5 3xl:py-3',
  item,
  depth = 0,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { pathname, query } = router;

  // Extract the selected category ID from the URL
  const selectedCategory = useMemo(
    () => (typeof query?.category === 'string' ? query.category : undefined),
    [query?.category]
  );

  // Determine if the current item is active
  const active = selectedCategory === item.id;

  // Determine if any child of the current item is active
  const isChildActive = useMemo(() => {
    const checkChildActive = (category: Category): boolean => {
      if (category.id === selectedCategory) return true;
      return category.children?.some(checkChildActive) ?? false;
    };
    return checkChildActive(item);
  }, [item, selectedCategory]);

  const { displaySidebar, closeSidebar } = useUI();

  const hasChildren = item.children && item.children.length > 0;

  // State to manage the expand/collapse of subcategories
  const [isOpen, setOpen] = useState<boolean>(false);

  useEffect(() => {
    // Keep the parent category open if it's active or any of its children are active
    if (active || isChildActive) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [active, isChildActive]);

  // Handle category selection
  function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation(); // Prevent event bubbling

    const { category, ...restQuery } = query;

    // Get the category name formatted for the URL
    const formattedCategoryName = item.name.replace(/\s+/g, '-').toLowerCase();

    if (active) {
      // Deselect the category by removing the query parameter
      router.push(
        {
          pathname,
          query: restQuery,
        },
        undefined,
        { scroll: false }
      );
    } else {
      // Select the category (either parent or subcategory) and add the formatted name in the URL
      router.push(
        {
          pathname,
          query: {
            ...restQuery,
            name: formattedCategoryName, // Set the category name for UX purposes
            category: item.id, // Set the category ID
          },
        },
        undefined,
        { scroll: false }
      );
    }

    if (displaySidebar) closeSidebar();
  }

  // Toggle expand/collapse for subcategories
  function toggleCollapse(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation(); // Prevent event bubbling
    setOpen(!isOpen);
  }

  // Determine the expand/collapse icon
  let expandIcon = null;
  if (hasChildren) {
    expandIcon = isOpen ? (
      <IoIosArrowUp className="text-base text-brand-dark text-opacity-40" />
    ) : (
      <IoIosArrowDown className="text-base text-brand-dark text-opacity-40" />
    );
  }

  return (
    <>
      <li
        className={cn(
          'flex justify-between items-center transition text-sm md:text-15px',
          { 'bg-fill-base': active || isChildActive },
          className
        )}
      >
        <button
          onClick={onClick} // Allow selecting the category
          className={cn(
            'flex items-center w-full ltr:text-left rtl:text-right cursor-pointer group',
            { 'py-3 xl:py-3.5 2xl:py-2.5 3xl:py-3': depth > 0 }
          )}
          type="button"
        >
          {item.icon && (
            <div className="inline-flex shrink-0 ltr:mr-2.5 rtl:ml-2.5 md:ltr:mr-4 md:rtl:ml-4">
              <Image
                src={item.icon}
                alt={item.name || t('text-category-thumbnail')}
                width={40}
                height={40}
              />
            </div>
          )}
          <span className="text-brand-dark capitalize py-0.5">
            {depth > 0 ? item.slug : item.name}
          </span>
          {depth > 0 && (
            <span
              className={`w-[22px] h-[22px] text-13px flex items-center justify-center border-2 border-border-four rounded-full ltr:ml-auto rtl:mr-auto transition duration-500 ease-in-out group-hover:border-yellow-100 text-brand-light ${
                active && 'border-yellow-100 bg-yellow-100'
              }`}
            >
              {active && <FaCheck />}
            </span>
          )}
          {hasChildren && (
            <button
              className="ml-auto"
              onClick={toggleCollapse} // Toggling subcategories without selecting the parent
            >
              {expandIcon}
            </button>
          )}
        </button>
      </li>
      {hasChildren && isOpen && (
        <li>
          <ul key="content" className="px-4 text-xs">
            {item.children.map((currentItem: Category) => (
              <CategoryFilterMenuItem
                key={currentItem.id}
                item={currentItem}
                depth={depth + 1}
                className="px-0 border-t border-border-base first:border-t-0 mx-[3px] bg-transparent"
              />
            ))}
          </ul>
        </li>
      )}
    </>
  );
};

export default CategoryFilterMenu;
