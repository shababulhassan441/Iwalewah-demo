"use client"
import UserIcon from '@components/icons/user-icon';
import UserIconBlack from '@components/icons/user-icon-black';
import Link from '@components/ui/link';
import React from 'react';
import { useEffect, useState } from "react";
import { getCurrentUser } from 'src/appwrite/Services/authServices';


interface Props {
  isAuthorized: boolean;
  btnProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const AuthMenu: React.FC<Props> = ({ isAuthorized, btnProps }) => {
  const [user, setUser] = useState<any | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  fetchUser();
}, []);

  return isAuthorized ? (
    <Link
      href={
        user?.email === "demo@iwalewah.com"
          ? "/my-account/orders"
          : "/my-account/account-settings"
      }
      className="flex items-center text-sm font-normal lg:text-15px text-brand-dark focus:outline-none ltr:ml-2 rtl:mr-2"
    >
      {/* Show UserIcon always */}
      <UserIconBlack className="inline lg:hidden " />

      {/* Show "My Account" text only on large screens */}
      <span className="hidden lg:inline ltr:ml-1 rtl:mr-1 text-white">
        My Account
      </span>
    </Link>
  ) : (
    <button
      className="flex items-center text-sm font-normal lg:text-15px text-brand-dark focus:outline-none ltr:ml-2 rtl:mr-2"
      aria-label="Sign In"
      {...btnProps}
    >
      {/* Show UserIcon always */}

      <UserIconBlack className="inline lg:hidden text-white" />

      {/* Show "Login" text only on large screens */}
      <span className="hidden lg:inline ltr:ml-1 rtl:mr-1 text-white">
        Login / Signup
      </span>
    </button>
  );
};

export default AuthMenu;
