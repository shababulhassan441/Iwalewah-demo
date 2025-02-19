// src/components/product/product-popup.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ROUTES } from '@utils/routes';
import Button from '@components/ui/button';
import Counter from '@components/ui/counter';
import { useCart } from '@contexts/cart/cart.context';
import usePrice from '@framework/product/use-price';
import { useTranslation } from 'next-i18next';
import ThumbnailCarousel from '@components/ui/carousel/thumbnail-carousel';
import Image from 'next/image';
import CartIcon from '@components/icons/cart-icon';
import Heading from '@components/ui/heading';
import Text from '@components/ui/text';
import TagLabel from '@components/ui/tag-label';
import LabelIcon from '@components/icons/label-icon';
import { IoArrowRedoOutline } from 'react-icons/io5';
import SocialShareBox from '@components/ui/social-share-box';
import { IoIosHeart, IoIosHeartEmpty } from 'react-icons/io';
import { toast } from 'react-toastify';
import useWindowSize from '@utils/use-window-size';
import {
  useModalAction,
  useModalState,
} from '@components/common/modal/modal.context';
import CloseButton from '@components/ui/close-button';
import { productGalleryPlaceholder } from '@assets/placeholders';
import storageServices from 'src/appwrite/Services/storageServices';
import db from 'src/appwrite/Services/dbServices';
import { Product } from '@framework/types';
import RelatedProductFeed from './feeds/related-product-feed';
import { ID, Query } from 'appwrite';
import { useUser } from 'src/contexts/user.context';
import AgeConfirmationModal from './age-confirmation-modal';

// Interfaces for Cart and Wishlist
interface CartItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface WishlistDocument {
  $id: string;
  userId: string;
  productIds: string[];
}

// Helper function to get image URL
const getImageUrlFromStaticData = (image: any): string =>
  typeof image === 'string' ? image : image?.src ?? '';

const ProductPopup: React.FC = () => {
  const { t } = useTranslation('common');
  const { data } = useModalState();
  const { width } = useWindowSize();
  const { closeModal } = useModalAction();
  const router = useRouter();
  const { addItemToCart, isInCart, getItemFromCart } = useCart();
  const { user: userInfo, loading: userLoading } = useUser();

  // State variables
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const [notifyLoader, setNotifyLoader] = useState<boolean>(false);
  const [addToWishlistLoader, setAddToWishlistLoader] =
    useState<boolean>(false);
  const [shareButtonStatus, setShareButtonStatus] = useState<boolean>(false);
  const [favorite, setFavorite] = useState<boolean>(false); // New state for wishlist
  const [wishlistDocId, setWishlistDocId] = useState<string | null>(null); // To store the Wishlist document ID

  // State for Age Confirmation Modal
  const [showAgeConfirmation, setShowAgeConfirmation] =
    useState<boolean>(false);
  const [proceedToCart, setProceedToCart] = useState<boolean>(false);

  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Define default product data in case 'data' is null
  const defaultProduct: any = {
    id: '',
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    stockQuantity: 0,
    images: [],
    tags: [],
    categoryId: '',
    isOnSale: false,
    isWholesaleProduct: false,
    bannerLabel: '',
    minimumPurchaseQuantity: 1,
  };

  // Current product data
  const currentProduct: Product = data ? (data as Product) : defaultProduct;

  const {
    id = '',
    name = '',
    description = '',
    price: productPrice = 0,
    discountPrice = 0,
    stockQuantity = 0,
    images = [],
    tags = [],
    categoryId = '',
    isOnSale = false,
    isWholesaleProduct = false,
    bannerLabel = '',
    minimumPurchaseQuantity = 1,
  } = currentProduct as Product & {
    minimumPurchaseQuantity?: number;
    bannerLabel?: string;
  };

  // Determine the minimum quantity based on product type
  const minQuantity = isWholesaleProduct ? minimumPurchaseQuantity || 1 : 1;

  // Price calculation
  const { price, basePrice, discount } = usePrice({
    amount: isOnSale && discountPrice ? discountPrice : productPrice,
    baseAmount: productPrice,
    currencyCode: 'GBP',
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [productVideos, setProductVideos] = useState<string[]>([]);

  // Fetch and set product images
  useEffect(() => {
    let isMounted = true;

    const fetchMedia = async () => {
      try {
        // Fetch images
        if (images && images.length > 0) {
          const imageUrls = await Promise.all(
            images.map(async (imageId: string) => {
              try {
                const imagePreviewUrl = await storageServices[
                  'images'
                ].getFilePreview(imageId);
                return imagePreviewUrl.href;
              } catch (error) {
                console.error('Error fetching image:', error);
                return getImageUrlFromStaticData(productGalleryPlaceholder);
              }
            })
          );
          if (isMounted) setProductImages(imageUrls);
        } else {
          if (isMounted)
            setProductImages([
              getImageUrlFromStaticData(productGalleryPlaceholder),
            ]);
        }

        // Fetch videos
        if (currentProduct?.videoId && Array.isArray(currentProduct.videoId)) {
          const videoUrls = await Promise.all(
            currentProduct.videoId.map(async (videoId: string) => {
              try {
                const videoUrl = await storageServices['videos'].getFileView(
                  videoId
                );
                return videoUrl.href;
              } catch (error) {
                console.error('Error fetching video:', error);
                return '';
              }
            })
          );
          if (isMounted)
            setProductVideos(videoUrls.filter((url) => url !== ''));
        }
      } catch (error) {
        console.error('Error processing media:', error);
        if (isMounted) {
          setProductImages([
            getImageUrlFromStaticData(productGalleryPlaceholder),
          ]);
          setProductVideos([]);
        }
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
    };
  }, [images, currentProduct?.videoId]);

  // Define the cart item using useMemo
  const item: CartItem = useMemo(
    () => ({
      id,
      name,
      price: isOnSale && discountPrice ? discountPrice : productPrice,
      stock: stockQuantity,
      image:
        productImages[0] ||
        getImageUrlFromStaticData(productGalleryPlaceholder),
      isWholesaleProduct,
      minimumPurchaseQuantity,
    }),
    [
      id,
      name,
      isOnSale,
      discountPrice,
      productPrice,
      stockQuantity,
      productImages,
      isWholesaleProduct,
      minimumPurchaseQuantity,
    ]
  );

  // Authorization Logic: Check if the user is authorized to view the product
  useEffect(() => {
    if (isWholesaleProduct) {
      if (!userInfo || !userInfo.isWholesaleApproved) {
        setIsAuthorized(false);
        toast.error('Unauthorized Access', {
          progressClassName: 'fancy-progress-bar',
          position: width && width > 768 ? 'bottom-right' : 'top-right',
          autoClose: 2000,
        });
        closeModal(); // Close the popup if unauthorized
      } else {
        setIsAuthorized(true);
      }
    } else {
      setIsAuthorized(true);
    }
  }, [isWholesaleProduct, userInfo, t, width, closeModal]);

  // Initialize Wishlist using the new logic with useUser and dbServices
  useEffect(() => {
    const initializeWishlist = async () => {
      if (!userInfo) {
        setFavorite(false);
        setWishlistDocId(null);
        return;
      }

      try {
        // Fetch the user's wishlist documents
        const wishlistList = await db.Wishlist.list([
          Query.equal('userId', userInfo.id),
        ]);

        if (wishlistList.documents.length > 0) {
          const wishlistDoc = wishlistList.documents[0] as any;
          setWishlistDocId(wishlistDoc.$id);
          // Check if the current product is in the wishlist
          if (wishlistDoc.productIds.includes(id)) {
            setFavorite(true);
          } else {
            setFavorite(false);
          }

          // Handle multiple wishlist documents (if any)
          if (wishlistList.documents.length > 1) {
            // Optionally, consolidate productIds from all documents
            const allProductIds = wishlistList.documents.reduce<string[]>(
              (acc, doc) => acc.concat(doc.productIds),
              []
            );
            // Remove duplicates
            const uniqueProductIds = Array.from(new Set(allProductIds));

            // Update the first document with the consolidated productIds
            await db.Wishlist.update(wishlistDoc.$id, {
              productIds: uniqueProductIds,
            });

            // Delete the remaining duplicate documents
            for (let i = 1; i < wishlistList.documents.length; i++) {
              await db.Wishlist.delete(wishlistList.documents[i].$id);
            }

            // Update state based on consolidated wishlist
            setFavorite(uniqueProductIds.includes(id));
          }
        } else {
          // No wishlist document exists for the user
          setWishlistDocId(null);
          setFavorite(false);
        }
      } catch (error) {
        console.error('Error initializing wishlist:', error);
        setFavorite(false);
      }
    };

    initializeWishlist();
  }, [id, userInfo]);

  // Reset quantity when product changes
  useEffect(() => setSelectedQuantity(minQuantity), [id, minQuantity]);

  // Effect to handle proceedToCart
  useEffect(() => {
    if (proceedToCart) {
      proceedAddToCart();
      setProceedToCart(false);
    }
  }, [proceedToCart]);

  // Early returns after all hooks have been called
  if (!data) {
    return null; // or a loader/error message
  }

  if (isAuthorized === null) {
    return <p>Loading...</p>; // Or a loader component
  }

  if (isAuthorized === false) {
    return null; // The popup has already been closed in the authorization effect
  }

  const handleChange = () => {
    setShareButtonStatus(!shareButtonStatus);
  };

  // Construct the product URL for sharing
  const productUrl = `https://iwalewah.co.uk/products/${id}-${slugify(name)}`;

  // Helper function to slugify the product name
  function slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }

  // Function to add item to cart with age confirmation logic
  const addToCart = () => {
    if (selectedQuantity < minQuantity) {
      toast.error(`Minimum purchase quantity is ${minQuantity}`, {
        progressClassName: 'fancy-progress-bar',
        position: width! > 768 ? 'bottom-right' : 'top-right',
        autoClose: 2000,
      });
      return;
    }

    if (bannerLabel && bannerLabel.trim() !== '') {
      // Show age confirmation modal
      setShowAgeConfirmation(true);
    } else {
      // Proceed to add to cart directly
      proceedAddToCart();
    }
  };

  // Function to proceed adding to cart after age confirmation
  const proceedAddToCart = () => {
    setAddToCartLoader(true);
    setTimeout(() => {
      setAddToCartLoader(false);
    }, 1500);
    addItemToCart(item as any, selectedQuantity);
    toast(t('text-added-bag'), {
      progressClassName: 'fancy-progress-bar',
      position: width! > 768 ? 'bottom-right' : 'top-right',
      autoClose: 1500,
    });
  };

  // Function to handle age confirmation
  const handleAgeConfirm = () => {
    setShowAgeConfirmation(false);
    setProceedToCart(true);
  };

  const handleAgeCancel = () => {
    setShowAgeConfirmation(false);
  };

  // Function to navigate to product page
  const navigateToProductPage = () => {
    closeModal();
    router.push(`${ROUTES.PRODUCT}/${id}-${slugify(name)}`);
  };

  // Function to add or remove product from wishlist
  const addToWishlist = async () => {
    if (!userInfo) {
      toast(t('common:text-login-to-wishlist'), {
        progressClassName: 'fancy-progress-bar',
        position: width && width > 768 ? 'bottom-right' : 'top-right',
        autoClose: 2000,
      });
      return;
    }

    setAddToWishlistLoader(true);

    try {
      if (wishlistDocId) {
        // Wishlist document exists; update it
        let updatedProductIds: string[];

        if (!favorite) {
          // Add to wishlist
          const currentProductIds = await getWishlistProductIds();
          updatedProductIds = [...currentProductIds, id];
          // Ensure no duplicates
          updatedProductIds = Array.from(new Set(updatedProductIds));
          setFavorite(true);
          toast(t('text-added-favorite'), {
            progressClassName: 'fancy-progress-bar',
            position: width && width > 768 ? 'bottom-right' : 'top-right',
            autoClose: 1500,
          });
        } else {
          // Remove from wishlist
          const currentProductIds = await getWishlistProductIds();
          updatedProductIds = currentProductIds.filter(
            (productId) => productId !== id
          );
          setFavorite(false);
          toast(t('text-remove-favorite'), {
            progressClassName: 'fancy-progress-bar',
            position: width && width > 768 ? 'bottom-right' : 'top-right',
            autoClose: 1500,
          });
        }

        // Update the wishlist document
        await db.Wishlist.update(wishlistDocId, {
          productIds: updatedProductIds,
        });
      } else {
        // Wishlist document does not exist; create it
        if (!favorite) {
          const newWishlistDoc = await db.Wishlist.create({
            userId: userInfo.id,
            productIds: [id],
          });
          setWishlistDocId(newWishlistDoc.$id); // Use the actual created document's ID
          setFavorite(true);
          toast(t('text-added-favorite'), {
            progressClassName: 'fancy-progress-bar',
            position: width && width > 768 ? 'bottom-right' : 'top-right',
            autoClose: 1500,
          });
        }
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      toast(t('common:text-wishlist-error'), {
        progressClassName: 'fancy-progress-bar',
        position: width && width > 768 ? 'bottom-right' : 'top-right',
        autoClose: 1500,
      });
    } finally {
      setAddToWishlistLoader(false);
    }
  };

  // Helper function to fetch current wishlist product IDs
  const getWishlistProductIds = async (): Promise<string[]> => {
    if (!wishlistDocId) return [];
    try {
      const wishlistDoc = await db.Wishlist.get(wishlistDocId);
      return wishlistDoc.productIds;
    } catch (error) {
      console.error('Error fetching wishlist product IDs:', error);
      return [];
    }
  };

  // Function to handle "Notify when Restocked" click
  const notifyWhenRestocked = async () => {
    if (!userInfo) {
      toast(t('Login to be notified'), { autoClose: 2000 });
      return;
    }

    setNotifyLoader(true);

    try {
      const payload = {
        userId: userInfo.id, // Assuming userInfo.id contains the current user's ID
        productId: id,
        productName: name,
        requestStatus: 'pending',
        isRead: false,
        createdAt: new Date().toISOString(),
        notifiedAt: null, // Will be set when the product is back in stock
      };

      await db.ProductsNotification.create(payload, ID.unique());
      toast(t(`Product added to pending Restock Notification`), {
        progressClassName: 'fancy-progress-bar',
        position: width && width > 768 ? 'bottom-right' : 'top-right',
        autoClose: 1500,
      });
    } catch (error: any) {
      toast(t(`Error while adding to Notify: ${error}`), {
        progressClassName: 'error',
        position: width && width > 768 ? 'bottom-right' : 'top-right',
        autoClose: 1500,
      });
    } finally {
      setNotifyLoader(false);
    }
  };

  return (
    <>
      {/* Age Confirmation Modal */}
      {showAgeConfirmation && (
        <AgeConfirmationModal
          onConfirm={handleAgeConfirm}
          onCancel={handleAgeCancel}
        />
      )}

      <div className="md:w-[600px] lg:w-[940px] xl:w-[1180px] 2xl:w-[1360px] mx-auto p-1 lg:p-0 xl:p-3 bg-brand-light rounded-md">
        <CloseButton onClick={closeModal} />
        <div className="overflow-hidden">
          <div className="px-4 pt-4 md:px-6 lg:p-8 2xl:p-10 mb-9 lg:mb-2 md:pt-7 2xl:pt-10">
            <div className="items-start justify-between lg:flex">
              <div className="items-center justify-center mb-6 overflow-hidden xl:flex md:mb-8 lg:mb-0">
                {productImages.length > 1 || productVideos.length > 0 ? (
                  <ThumbnailCarousel
                    gallery={productImages}
                    videos={productVideos}
                    thumbnailClassName="xl:w-[700px] 2xl:w-[900px]"
                    galleryClassName="xl:w-[150px] 2xl:w-[170px]"
                  />
                ) : (
                  <div className="flex items-center justify-center w-auto">
                    <Image
                      src={
                        productImages[0] ||
                        getImageUrlFromStaticData(productGalleryPlaceholder)
                      }
                      alt={name}
                      width={650}
                      height={590}
                      unoptimized
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col lg:pl-5 xl:pl-8 2xl:pl-10 lg:w-[430px] xl:w-[470px] 2xl:w-[480px]">
                <div className="pb-5">
                  <div
                    className="mb-2 md:mb-2.5 block -mt-1.5"
                    onClick={navigateToProductPage}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') navigateToProductPage();
                    }}
                  >
                    <h2 className="text-lg font-medium text-brand-dark md:text-xl xl:text-2xl hover:text-brand cursor-pointer">
                      {name}
                    </h2>
                  </div>

                  <div className="flex items-center mt-5">
                    <div className="text-brand-dark font-bold text-base md:text-xl xl:text-[22px]">
                      {price}
                    </div>
                    {discount && (
                      <>
                        <del className="text-sm text-opacity-50 md:text-15px ltr:pl-3 rtl:pr-3 text-brand-dark">
                          {basePrice}
                        </del>
                        <span className="inline-block rounded font-bold text-xs md:text-sm bg-brand-tree bg-opacity-20 text-brand-tree uppercase px-2 py-1 ltr:ml-2.5 rtl:mr-2.5">
                          {discount} {t('text-off')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pb-2">
                  {stockQuantity > 0 ? (
                    stockQuantity <= 25 ? (
                      <span className="text-sm font-medium text-yellow">
                        {t('text-only')} {stockQuantity} {t('text-left-item')}
                      </span>
                    ) : null // Do not display if stock is more than 25
                  ) : (
                    <div className="text-base text-brand-danger whitespace-nowrap">
                      {t('text-out-stock')}
                    </div>
                  )}
                </div>

                <div className="pt-1.5 lg:pt-3 xl:pt-4 space-y-2.5 md:space-y-3.5">
                  <Counter
                    variant="single"
                    value={selectedQuantity}
                    onIncrement={() => setSelectedQuantity((prev) => prev + 1)}
                    onDecrement={() =>
                      setSelectedQuantity((prev) =>
                        Math.max(prev - 1, minQuantity)
                      )
                    }
                    min={minQuantity}
                    disabled={
                      isInCart(item.id)
                        ? (getItemFromCart(item.id)?.quantity || 0) +
                            selectedQuantity >=
                          Number(stockQuantity)
                        : selectedQuantity >= Number(stockQuantity)
                    }
                  />
                  {isWholesaleProduct && minQuantity > 1 && (
                    <div className="text-sm text-gray-700 mt-2">
                      Minimum purchase quantity: {minQuantity}
                    </div>
                  )}
                  {stockQuantity > 0 ? (
                    <Button
                      onClick={addToCart}
                      className="w-full px-1.5"
                      loading={addToCartLoader}
                      disabled={
                        isInCart(item.id)
                          ? (getItemFromCart(item.id)?.quantity || 0) +
                              selectedQuantity >=
                            Number(stockQuantity)
                          : selectedQuantity >= Number(stockQuantity) &&
                            addToCartLoader
                      }
                    >
                      <CartIcon color="#ffffff" className="ltr:mr-3 rtl:ml-3" />
                      {t('text-add-to-cart')}
                    </Button>
                  ) : (
                    <Button
                      onClick={notifyWhenRestocked}
                      className="w-full px-1.5"
                      loading={notifyLoader}
                      disabled={notifyLoader}
                    >
                      Notify Me on Restock
                    </Button>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Wishlist Button */}
                    <Button
                      variant="border"
                      onClick={addToWishlist}
                      loading={addToWishlistLoader}
                      className={`group hover:text-brand ${
                        favorite ? 'text-brand' : ''
                      }`}
                      disabled={addToWishlistLoader}
                    >
                      {favorite ? (
                        <IoIosHeart className="text-2xl md:text-[26px] ltr:mr-2 rtl:ml-2 transition-all" />
                      ) : (
                        <IoIosHeartEmpty className="text-2xl md:text-[26px] ltr:mr-2 rtl:ml-2 transition-all group-hover:text-brand" />
                      )}
                      {t('text-wishlist')}
                    </Button>
                    {/* Share Button */}
                    <div className="relative group">
                      <Button
                        variant="border"
                        className={`w-full hover:text-brand ${
                          shareButtonStatus ? 'text-brand' : ''
                        }`}
                        onClick={handleChange}
                      >
                        <IoArrowRedoOutline className="text-2xl md:text-[26px] ltr:mr-2 rtl:ml-2 transition-all group-hover:text-brand" />
                        {t('text-share')}
                      </Button>
                      <SocialShareBox
                        className={`absolute z-10 right-0 w-[300px] md:min-w-[400px] transition-all duration-300 ${
                          shareButtonStatus
                            ? 'visible opacity-100 top-full'
                            : 'opacity-0 invisible top-[130%]'
                        }`}
                        shareUrl={productUrl}
                      />
                    </div>
                  </div>
                </div>
                {/* Tags Section */}
                {tags && tags.length > 0 && (
                  <ul className="pt-5 xl:pt-6">
                    <li className="relative inline-flex items-center justify-center text-sm md:text-15px text-brand-dark text-opacity-80 ltr:mr-2 rtl:ml-2 top-1">
                      <LabelIcon className="ltr:mr-2 rtl:ml-2" />{' '}
                      {t('text-tags')}:
                    </li>
                    {tags.map((tagName: string, index: number) => (
                      <li className="inline-block p-[3px]" key={`tag-${index}`}>
                        <TagLabel
                          data={{ id: index.toString(), name: tagName }}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Product Description */}
                <div className="pt-6 xl:pt-8">
                  <Heading className="mb-3 lg:mb-3.5">
                    {t('text-product-details')}:
                  </Heading>
                  <Text variant="small">
                    {/* Use dangerouslySetInnerHTML to render HTML content */}
                    <div
                      dangerouslySetInnerHTML={{ __html: description || '' }}
                    ></div>
                    <span
                      onClick={navigateToProductPage}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') navigateToProductPage();
                      }}
                      className="text-brand ml-0.5 cursor-pointer"
                    >
                      {t('text-read-more')}
                    </span>
                  </Text>
                </div>
              </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-10">
              <RelatedProductFeed
                tags={tags || []}
                categoryId={categoryId}
                currentProductId={id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPopup;
