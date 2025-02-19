// @components/product/product-details/product-details-tab.tsx

import { useState } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

interface ProductDetailsTabProps {
  description: string;
}

export default function ProductDetailsTab({ description }: ProductDetailsTabProps) {
  let [tabHeading] = useState({
    Product_Details: '',
    // Review_Rating: '',
  });

  return (
    <div className="w-full xl:px-2 py-11 lg:py-14 xl:py-16 sm:px-0">
      <Tab.Group>
        <Tab.List className="block border-b border-border-base">
          {Object.keys(tabHeading).map((item) => (
            <Tab
              key={item}
              className={({ selected }) =>
                classNames(
                  'relative inline-block transition-all text-15px lg:text-17px leading-5 text-brand-dark focus:outline-none pb-3 lg:pb-5 hover:text-brand ltr:mr-8 rtl:ml-8',
                  selected
                    ? 'font-semibold after:absolute after:w-full after:h-0.5 after:bottom-0 after:translate-y-[1px] after:ltr:left-0 after:rtl:right-0 after:bg-brand'
                    : ''
                )
              }
            >
              {item.split('_').join(' ')}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6 lg:mt-9">
          <Tab.Panel>
            <div className="text-sm sm:text-15px text-brand-muted leading-[2em] space-y-4 lg:space-y-5 xl:space-y-7">
              {/* Render description using dangerouslySetInnerHTML */}
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          </Tab.Panel>
          <Tab.Panel>
            {/* You can keep the ProductReviewRating component or remove it if not needed */}
            {/* <ProductReviewRating /> */}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
