import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import { useTranslation } from 'next-i18next';
import { useModalAction } from '@components/common/modal/modal.context';
import usePrice from '@framework/product/use-price';
import storageServices from 'src/appwrite/Services/storageServices';
import { productPlaceholder } from '@assets/placeholders';
import dynamic from 'next/dynamic';
import { Product } from '@framework/types';

const AddToCart: any = dynamic(
  () => import('@components/product/add-to-cart'),
  {
    ssr: false,
  }
);

const getImageUrlFromStaticData = (image: any): string =>
  typeof image === 'string' ? image : image?.src ?? '';

async function fetchProductImage(imageId: string): Promise<string> {
  const imagePreviewUrl = storageServices['images'].getFilePreview(imageId);
  return imagePreviewUrl.href;
}

function RenderPopupOrAddToCart({ data }: { data: Product }) {
  const { t } = useTranslation('common');
  const { stockQuantity = 0 } = data ?? {}; // Ensure stockQuantity is a number

  const outOfStock = Number(stockQuantity) < 1;

  if (outOfStock) {
    return (
      <span
        className="text-[11px] md:text-xs font-bold text-brand-light uppercase inline-block bg-brand-danger rounded-full px-2.5 pt-1 pb-[3px] mx-0.5 sm:mx-1"
        aria-label={t('text-out-stock')}
      >
        {t('text-out-stock')}
      </span>
    );
  }

  return <AddToCart data={data} />;
}

interface ProductProps {
  product: Product & { minimumPurchaseQuantity?: number };
  className?: string;
}

const ProductCard: React.FC<ProductProps> = ({ product, className }) => {
  const { openModal } = useModalAction();
  const { t } = useTranslation('common');

  const {
    id,
    name,
    price: productPrice,
    discountPrice,
    images,
    isOnSale,
    stockQuantity = 0,
    bannerLabel,
    isWholesaleProduct = false,
    minimumPurchaseQuantity = 1,
  } = product;

  // Price calculation
  const { price, basePrice, discount } = usePrice({
    amount:
      isOnSale && (discountPrice || 0) < productPrice
        ? discountPrice
        : productPrice,
    baseAmount: productPrice,
    currencyCode: 'GBP',
  });

  const [productImage, setProductImage] = useState<string>(
    getImageUrlFromStaticData(productPlaceholder)
  );

  useEffect(() => {
    if (images && images.length > 0) {
      fetchProductImage(images[0])
        .then((url) => {
          setProductImage(url);
        })
        .catch(() => {
          setProductImage(getImageUrlFromStaticData(productPlaceholder));
        });
    } else {
      setProductImage(getImageUrlFromStaticData(productPlaceholder));
    }
  }, [images]);

  function handlePopupView() {
    openModal('PRODUCT_VIEW', product);
  }

  return (
    <article
      className={cn(
        'flex flex-col group overflow-hidden rounded-md cursor-pointer transition-all duration-300 shadow-card hover:shadow-cardHover relative h-full',
        className
      )}
      title={name}
    >
      <div className="relative shrink-0" onClick={handlePopupView}>
        <div className="flex h-[280px] overflow-hidden max-w-[230px] mx-auto transition duration-200 ease-in-out transform group-hover:scale-105 relative">
          <img
            src={productImage}
            alt={name || 'Product Image'}
            width={230}
            height={200}
            style={{ objectFit: 'cover', backgroundColor: '#f5f5f5' }}
            loading="lazy"
          />
        </div>

        {/* Badge container */}
        <div className="absolute top-2 left-2 flex flex-col items-start space-y-2">
          {/* "On Sale" Badge */}
          {discount && (
            <span className="text-[10px] sm:text-[11px] md:text-xs font-bold text-brand-light uppercase inline-block bg-brand rounded-full px-2 py-1">
              {t('text-on-sale')}
            </span>
          )}

          {/* `bannerLabel` Badge */}
          {bannerLabel && (
            <span
              className="text-[10px] sm:text-[11px] md:text-xs font-bold text-brand-light uppercase inline-block bg-brand-danger rounded-full px-2 py-1"
              aria-label={String(bannerLabel)}
            >
              {bannerLabel}
            </span>
          )}
        </div>

        {!bannerLabel && (
          <div className="w-full h-full absolute top-0 pt-2.5 md:pt-3.5 px-3 md:px-4 lg:px-[18px] z-10 -mx-0.5 sm:-mx-1">
            <div className="block product-count-button-position">
              <RenderPopupOrAddToCart data={product} />
            </div>
          </div>
        )}
      </div>

      <div
        className="flex flex-col px-3 md:px-4 lg:px-[18px] pb-5 lg:pb-6 lg:pt-1.5 h-full"
        onClick={handlePopupView}
      >
        <div className="mb-1 lg:mb-1.5 -mx-1">
          <span className="inline-block mx-1 text-sm font-semibold sm:text-15px lg:text-base text-brand-dark">
            {price}
          </span>
          {basePrice && (
            <del className="mx-1 text-sm text-brand-dark text-opacity-70">
              {basePrice}
            </del>
          )}
        </div>
        <h2 className="text-brand-dark text-13px sm:text-sm lg:text-15px leading-5 sm:leading-6 mb-1.5">
          {name}
        </h2>
        {isWholesaleProduct && minimumPurchaseQuantity > 1 && (
          <div className="text-xs text-gray-600 mt-1">
            Minimum purchase quantity: {minimumPurchaseQuantity}
          </div>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
