// src/components/ui/link.tsx

import NextLink from 'next/link';
import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children, className, ...props }) => {
  return (
    <NextLink href={href} passHref>
      <a className={className} {...props}>
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
