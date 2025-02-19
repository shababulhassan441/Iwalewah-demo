import Image from 'next/image';
import Link from '@components/ui/link';
import cn from 'classnames';
import { siteSettings } from '@settings/site-settings';

const PurpleLogo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  href = siteSettings.logo.href,
  ...props
}) => {
  return (
    <Link
      href={href}
      className={cn('inline-flex focus:outline-none', className)}
      {...props}
    >
      <Image
        src={siteSettings.purpleLogo.url}
        alt={siteSettings.purpleLogo.alt}
        height={siteSettings.purpleLogo.height}
        width={siteSettings.purpleLogo.width}
        layout="fixed"
        loading="eager"
        className="object-contain"
      />
    </Link>
  );
};

export default PurpleLogo;
