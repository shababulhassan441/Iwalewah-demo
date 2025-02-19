import { useTranslation } from 'next-i18next';
import { Attachment } from '@framework/types';
import useWindowSize from '@utils/use-window-size';
import Breadcrumb from '@components/ui/breadcrumb';
import cn from 'classnames';
import { useState, useEffect } from 'react';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';

interface HeaderProps {
  backgroundThumbnail?: Attachment | string;
  heroTitle?: string;
  mobileBackgroundThumbnail?: Attachment | string;
  variant?: 'default' | 'white';
  className?: string;
}

const PageHeroSection: React.FC<HeaderProps> = ({
  backgroundThumbnail = '/assets/images/page-hero-bg.png',
  heroTitle = 'text-page-title',
  mobileBackgroundThumbnail = '/assets/images/page-hero-bg-mobile.png',
  variant = 'default',
  className = '',
}) => {
  const { t } = useTranslation('common');
  const { width } = useWindowSize();
  const [policyImageUrl, setPolicyImageUrl] = useState<string>(backgroundThumbnail as string);

  useEffect(() => {
    const fetchPolicyImage = async () => {
      try {
        const response = await db.Generalimages.list();
        const Generalimages = response.documents[0];

        if (Generalimages && Generalimages.policyImage) {
          const imageUrl = storageServices.images.getFileView(Generalimages.policyImage).href;
          setPolicyImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch policy image:', error);
        // Keep the default image if there's an error
      }
    };

    fetchPolicyImage();
  }, []);

  return (
    <div
      className={cn(
        'flex justify-center md:min-h-[250px] lg:min-h-[288px] py-20 w-full bg-cover bg-no-repeat bg-center page-header-banner',
        {
          'style-variant-white': variant === 'white',
        },
        className
      )}
      style={{
        backgroundImage: `url(${policyImageUrl})`,
      }}
    >
      <div className="relative flex flex-col items-center justify-center w-full">
        <h2
          className={cn(
            'text-xl md:text-2xl lg:text-3xl 2xl:text-[40px] font-bold text-center',
            {
              'text-brand-dark': variant === 'default',
              'text-brand-light': variant === 'white',
            }
          )}
        >
          <span className="block mb-3 font-bold font-manrope md:mb-4 lg:mb-5 2xl:mb-7 ">
            {t(heroTitle)}
          </span>
        </h2>
        <Breadcrumb />
      </div>
    </div>
  );
};

export default PageHeroSection;
