// src/components/common/contact-information.tsx

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import LocationIcon from '@components/icons/contact/location-icon';
import PhoneIcon from '@components/icons/contact/phone-icon';
import MailIcon from '@components/icons/contact/mail-icon';
import Text from '@components/ui/text';
import Heading from '@components/ui/heading';
import db from 'src/appwrite/Services/dbServices';

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

const ContactInformation: FC = () => {
  const { t } = useTranslation('common');
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await db['ContactInfo'].list();
        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setContactInfo({
            address: doc.address,
            phone: doc.phone,
            email: doc.email,
          });
        } else {
          setError(t('text-no-contact-info-found'));
        }
      } catch (err) {
        console.error('Error fetching contact information:', err);
        setError(t('text-failed-to-fetch-contact-info'));
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [t]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <Text className="text-brand-muted">{t('text-loading')}</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <Text className="text-red-500">{error}</Text>
      </div>
    );
  }

  if (!contactInfo) {
    return null; // Or display a fallback UI
  }

  const data = [
    {
      id: 1,
      icon: (
        <LocationIcon className="w-12 lg:w-13 xl:w-[60px] h-12 lg:h-13 xl:h-[60px]" />
      ),
      name: 'text-office-location',
      description: contactInfo.address,
    },
    {
      id: 2,
      icon: (
        <PhoneIcon className="w-12 lg:w-13 xl:w-[60px] h-12 lg:h-13 xl:h-[60px]" />
      ),
      name: 'text-phone',
      description: contactInfo.phone,
    },
    {
      id: 3,
      icon: (
        <MailIcon className="w-12 lg:w-13 xl:w-[60px] h-12 lg:h-13 xl:h-[60px]" />
      ),
      name: 'text-email',
      description: contactInfo.email,
    },
  ];

  return (
    <div className="px-5 lg:px-0 xl:px-12 sm:grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-7 max-w-[1420px] mx-auto space-y-7 sm:space-y-0 pt-1">
      {data.map((item) => (
        <div
          key={`contact--key${item.id}`}
          className="flex flex-col max-w-xs lg:flex-row lg:max-w-sm xl:ltr:pr-7 xl:rtl:pl-7"
        >
          <div className="shrink-0 w-14 xl:w-16">{item.icon}</div>
          <div className="mt-4 lg:ltr:pl-3 lg:rtl:pr-3 2xl:ltr:pl-4 2xl:rtl:pr-4 lg:mt-0">
            <Heading variant="title" className="mb-2 lg:mb-2.5 font-bold">
              {t(item.name)}
            </Heading>
            <Text>{item.description}</Text>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInformation;
