import Layout from '@components/layout/layout';
import Container from '@components/ui/container';
import Heading from '@components/ui/heading';
import PageHeroSection from '@components/ui/page-hero-section';
import { privacyPolicy, PrivacyPolicySection } from '@settings/privacy-data'; // Import the static data
import { Link, Element } from 'react-scroll';
import Seo from '@components/seo/seo';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
function makeTitleToDOMId(title: string) {
  return title.toLowerCase().split(' ').join('_');
}

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy - Iwalewah"
        description="Learn about how Iwalewah protects your data and privacy. Understand our commitment to safeguarding your information with our privacy policy."
        path="privacy"
      />

      <PageHeroSection heroTitle="Privacy Policy" />
      <div className="py-12 lg:py-16 2xl:py-20 xl:px-16 2xl:px-24 3xl:px-36">
        <Container>
          <div className="flex flex-col md:flex-row">
            {/* Scroll Spy Menu */}
            <nav className="hidden mb-8 sm:block md:w-72 xl:w-3/12 2xl:mb-0 lg:-mt-2">
              <ol className="sticky z-10 md:top-16 lg:top-20">
                {privacyPolicy?.map(
                  (item: PrivacyPolicySection, index: number) => (
                    <li key={index}>
                      <Link
                        spy={true}
                        offset={-120}
                        smooth={true}
                        duration={200}
                        to={makeTitleToDOMId(item.title)}
                        activeClass="text-brand font-medium borderColor relative ltr:pl-3 rtl:pr-3"
                        className="block py-3 text-sm font-medium transition-all cursor-pointer lg:text-15px text-brand-dark"
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                )}
              </ol>
            </nav>
            {/* End of Scroll Spy Menu */}

            {/* Privacy Policy Content */}
            <div className="md:w-9/12 md:ltr:pl-8 md:rtl:pr-8">
              {privacyPolicy?.map(
                (item: PrivacyPolicySection, index: number) => (
                  <Element
                    key={index}
                    name={makeTitleToDOMId(item.title)} // Added 'name' prop to resolve TypeScript error
                    id={makeTitleToDOMId(item.title)}
                    className="mb-8 lg:mb-12 last:mb-0 order-list-enable"
                  >
                    <Heading className="mb-4 lg:mb-6 font-body" variant="title">
                      {item.title}
                    </Heading>
                    <div
                      className="space-y-5 text-sm leading-7 text-brand-muted lg:text-15px"
                      dangerouslySetInnerHTML={{
                        __html: item.description,
                      }}
                    />
                  </Element>
                )
              )}
            </div>
            {/* End of Content */}
          </div>
        </Container>
      </div>
    </>
  );
}

PrivacyPage.Layout = Layout;
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, [
        'common',
        'forms',
        'menu',
        'privacy',
        'footer',
      ])),
    },
  };
};
