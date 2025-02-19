import Container from '@components/ui/container';
import Image from '@components/ui/image';
import { siteSettings } from '@settings/site-settings';
import { useTranslation } from 'next-i18next';

interface CopyrightProps {
  payment?: {
    id: string | number;
    path?: string;
    name: string;
    image: string;
    width: number;
    height: number;
  }[];
}
const year = new Date().getFullYear();
const Copyright: React.FC<CopyrightProps> = ({ payment }) => {
  const { t } = useTranslation('footer');
  return (
    <div className="pb-20 lg:pb-7">
      <Container>
        <div className="flex flex-col pt-6 text-center border-t md:flex-row md:justify-between border-border-three lg:pt-7">
          <a
            href={siteSettings.adminUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="text-brand-dark text-sm leading-7 lg:leading-[27px] lg:text-15px">
              &copy;&nbsp;{t('text-copyright')} {year}&nbsp;
              {/* <a
                className="transition-colors duration-200 ease-in-out text-brand-dark hover:text-brand"
                href={siteSettings.author.websiteUrl}
              > */}
              {siteSettings.author.name}
              {/* </a> */}
              &nbsp; {t('text-all-rights-reserved')}
            </p>
          </a>
        </div>
      </Container>
    </div>
  );
};

export default Copyright;
