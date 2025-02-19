import cn from 'classnames';
import React from 'react';

interface Props {
  className?: string;
  children?: any;
  el?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  clean?: boolean;
}

const Container: React.FC<Props> = ({
  children,
  className,
  el: Component = 'div', // Default to 'div' if no element is provided
  clean,
}) => {
  const rootClassName = cn(className, {
    'mx-auto max-w-[1920px] px-4 md:px-6 lg:px-8 2xl:px-10': !clean,
  });

  // Cast Component as 'any' to avoid type issues with JSX
  const ComponentAsAny = Component as any;

  return <ComponentAsAny className={rootClassName}>{children}</ComponentAsAny>;
};

export default Container;
