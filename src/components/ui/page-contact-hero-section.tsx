import { useTranslation } from 'react-i18next';
import { Attachment } from '@framework/types';
import { useState, useEffect } from 'react';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';

interface HeaderProps {
  heroTitle?: string;
  heroDescription?: string;
  backgroundThumbnail?: Attachment;
}

const PageContactHeroSection: React.FC<HeaderProps> = ({
  heroTitle = 'text-contact-page-header',
  heroDescription = 'text-contact-page-explore',
  backgroundThumbnail = '/assets/images/contact-page-banner.png',
}) => {
  const { t } = useTranslation('common');
  const [contactImageUrl, setContactImageUrl] = useState<string>(backgroundThumbnail as string);

  useEffect(() => {
    const fetchContactImage = async () => {
      try {
        const response = await db.Generalimages.list();
        const Generalimages = response.documents[0];

        if (Generalimages && Generalimages.contactImage) {
          const imageUrl = storageServices.images.getFileView(Generalimages.contactImage).href;
          setContactImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch contact image:', error);
        // Keep the default image if there's an error
      }
    };

    fetchContactImage();
  }, []);

  return (
    <div
      className="lg:min-h-[370px] 2xl:min-h-[455px] lg:py-0 h-auto pt-10 md:pt-14 pb-20 md:pb-24 flex lg:items-center bg-cover lg:bg-cover bg-left sm:bg-top lg:bg-center bg-no-repeat border-t border-border-base"
      style={{
        backgroundImage: `url(${contactImageUrl})`,
      }}
    >
      <div className="w-full max-w-[1484px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="sm:max-w-xs md:max-w-sm lg:max-w-xl lg:pb-5">
          <h2 className="font-manrope font-extrabold text-xl leading-7 md:leading-snug lg:leading-snug sm:text-2xl md:text-3xl lg:text-4xl 3xl:text-5xl 3xl:leading-snug text-brand-dark tracking-tight mb-2.5 md:ltr:pr-6 md:rtl:pl-6 lg:ltr:pr-36 lg:rtl:pl-36 3xl:ltr:pr-0 3xl:rtl:pl-0">
            {t(heroTitle)}
          </h2>
          <p className="text-15px lg:text-base xl:text-[17px] leading-7 lg:leading-8 xl:leading-9 text-brand-dark text-opacity-60 lg:ltr:pr-28 lg:rtl:pl-28">
            {t(heroDescription)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageContactHeroSection;
