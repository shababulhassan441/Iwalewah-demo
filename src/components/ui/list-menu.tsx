// src/components/ui/list-menu.tsx

import { useTranslation } from 'next-i18next';
import { FaChevronRight } from 'react-icons/fa';
import Link from '@components/ui/link';
import cn from 'classnames';
import { useState, useRef, useEffect } from 'react';

interface ListMenuProps {
  dept: number;
  data: any;
  hasSubMenu: boolean;
  menuName: string;
  menuIndex: number;
}

const ListMenu: React.FC<ListMenuProps> = ({ dept, data, hasSubMenu, menuName, menuIndex }) => {
  const { t } = useTranslation('menu');
  const [openSubMenuId, setOpenSubMenuId] = useState<number | null>(null);
  const submenuRef = useRef<HTMLUListElement>(null);

  // Close submenu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
      setOpenSubMenuId(null);
    }
  };

  useEffect(() => {
    if (openSubMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSubMenuId]);

  const handleMouseEnter = (id: number) => {
    setOpenSubMenuId(id);
  };

  const handleMouseLeave = () => {
    setOpenSubMenuId(null);
  };

  const handleToggleSubMenu = (id: number) => {
    setOpenSubMenuId(prev => (prev === id ? null : id));
  };

  return (
    <li className="relative">
      <div
        className="group"
        onMouseEnter={() => hasSubMenu && handleMouseEnter(data.id)}
        onMouseLeave={handleMouseLeave}
      >
        <Link
          href={data.path}
          className="flex items-center justify-between py-2 ltr:pl-5 rtl:pr-5 xl:ltr:pl-7 xl:rtl:pr-7 ltr:pr-3 rtl:pl-3 xl:ltr:pr-3.5 xl:rtl:pl-3.5 hover:bg-fill-dropdown-hover hover:text-brand-dark cursor-pointer"
          aria-haspopup={hasSubMenu ? "true" : "false"}
          aria-expanded={openSubMenuId === data.id}
          role="menuitem"
          // Remove onClick handler to allow navigation
        >
          {t(data.label)}
          {hasSubMenu && (
            <FaChevronRight className="text-sm ml-2" />
          )}
        </Link>
        {hasSubMenu && openSubMenuId === data.id && (
          <ul
            ref={submenuRef}
            className={cn(
              'absolute z-40 block transition duration-300 shadow-subMenu bg-brand-light ltr:left-full rtl:right-full top-0 w-56',
            )}
            role="menu"
          >
            {data.subMenu.map((submenu: any, subIndex: number) => (
              <ListMenu
                key={`submenu-${dept}-${menuIndex}-${subIndex}`}
                dept={dept + 1}
                data={submenu}
                hasSubMenu={!!submenu.subMenu && submenu.subMenu.length > 0}
                menuName={`sidebar-submenu-${dept + 1}-${menuIndex}-${subIndex}`}
                menuIndex={subIndex}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
};

export default ListMenu;
