// src/components/layout/header/header-menu.tsx

import Link from '@components/ui/link';
import { FaChevronDown } from 'react-icons/fa';
import ListMenu from '@components/ui/list-menu';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { useState, useRef, useEffect } from 'react';

interface MenuProps {
  data: any[];
  className?: string;
}

const HeaderMenu: React.FC<MenuProps> = ({ data, className }) => {
  const { t } = useTranslation('menu');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close submenu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (id: number) => {
    setOpenMenuId(id);
  };

  const handleMouseLeave = () => {
    setOpenMenuId(null);
  };

  // Optional: handle toggle on click if needed
  const handleToggleMenu = (id: number) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <nav
      ref={menuRef}
      className={cn(
        'headerMenu flex w-full relative -mx-3 xl:-mx-4',
        className
      )}
      role="menubar"
    >
      {data?.map((item: any) => (
        <div
          className="relative py-3 mx-3 cursor-pointer xl:mx-4"
          key={item.id}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={handleMouseLeave}
          role="none"
        >
          <Link
            href={item.path}
            className="flex items-center py-2 text-sm font-normal lg:text-15px text-white hover:white cursor-pointer"
            aria-haspopup={item.subMenu ? 'true' : 'false'}
            aria-expanded={openMenuId === item.id}
            role="menuitem"
            // Remove onClick handler to allow navigation
          >
            {t(item.label)}
            {item?.subMenu && (
              <span className="text-xs mt-1 xl:mt-0.5 w-4 flex justify-end text-white opacity-40 hover:text-brand">
                <FaChevronDown className="transition duration-300 ease-in-out transform hover:-rotate-180" />
              </span>
            )}
          </Link>

          {item?.subMenu && openMenuId === item.id && (
            <div
              className="absolute z-30 block transition duration-300 shadow-dropDown bg-brand-light ltr:left-0 rtl:right-0 top-full w-[220px] xl:w-[240px]"
              role="menu"
            >
              <ul className="py-5 text-sm text-brand-muted">
                {item.subMenu.map((menu: any, index: number) => {
                  const dept: number = 1;
                  const menuName: string = `sidebar-menu-${dept}-${index}`;
                  return (
                    <ListMenu
                      dept={dept}
                      data={menu}
                      hasSubMenu={!!menu.subMenu && menu.subMenu.length > 0}
                      menuName={menuName}
                      key={menuName}
                      menuIndex={index}
                    />
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default HeaderMenu;
