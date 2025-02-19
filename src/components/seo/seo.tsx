import { NextSeo, NextSeoProps } from 'next-seo';

interface SeoProps extends NextSeoProps {
  path: string;
}

const Seo = ({ title, description, path }: SeoProps) => {
  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;

  return (
    <NextSeo
      title={`${title} | Iwalewah`}
      description={`${description}. Shop with Iwalewah for top-quality products, exceptional service, and great deals.`}
      canonical={`${websiteUrl}/${path}`}
      openGraph={{
        url: `${websiteUrl}/${path}`,
        title: `${title} | Iwalewah`,
        description: `${description}. Discover quality products on Iwalewah, your trusted e-commerce store.`,
        images: [
          {
            url: '/assets/images/Logo-Purple-Background.png',
            width: 1200,
            height: 630,
            alt: 'Explore Quality Products on Iwalewah',
          },
          {
            url: '/assets/images/Logo-Purple-Background.png',
            width: 1200,
            height: 630,
            alt: 'Shop with Iwalewah for Best Deals',
          },
        ],
        site_name: 'Iwalewah',
      }}
      additionalMetaTags={[
        {
          name: 'keywords',
          content:
            'Iwalewah, e-commerce, online shopping, buy online, grocery, best deals, quality products',
        },
        {
          name: 'author',
          content: 'Iwalewah',
        },
      ]}
    />
  );
};

export default Seo;
