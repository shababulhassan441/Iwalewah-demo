// @components/ui/carousel/thumbnail-carousel.tsx

import {
  Swiper,
  SwiperSlide,
  SwiperOptions,
  Navigation,
  Thumbs,
} from '@components/ui/carousel/slider';
import Image from '@components/ui/image';
import { useRef, useState, useEffect } from 'react';
import cn from 'classnames';
import { productGalleryPlaceholder } from '@assets/placeholders';
import { getDirection } from '@utils/get-direction';
import { useRouter } from 'next/router';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BsPlayCircle } from 'react-icons/bs';

interface Props {
  gallery: string[]; // Image URLs
  videos?: string[]; // Video URLs
  thumbnailClassName?: string;
  galleryClassName?: string;
}

// product gallery breakpoints
const galleryCarouselBreakpoints = {
  '0': {
    slidesPerView: 4,
  },
};

const swiperParams: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
};

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
        video.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <div className="relative w-full h-full aspect-video flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain max-h-[590px]"
        preload="metadata"
        loop
        playsInline
      />
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300 hover:bg-opacity-40"
        >
          <BsPlayCircle className="w-16 h-16 text-white opacity-90 hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}
    </div>
  );
};

const ThumbnailCarousel: React.FC<Props> = ({
  gallery,
  videos = [],
  thumbnailClassName = 'xl:w-[480px] 2xl:w-[650px]',
  galleryClassName = 'xl:w-28 2xl:w-[130px]',
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const { locale } = useRouter();
  const dir = getDirection(locale);

  // Combine videos and images for the carousel
  const allMedia = [...videos, ...gallery];

  const isVideo = (index: number) => index < videos.length;

  return (
    <div className="w-full xl:flex xl:flex-row-reverse">
      <div
        className={cn(
          'w-full xl:ltr:ml-5 xl:rtl:mr-5 mb-2.5 md:mb-3 border border-border-base overflow-hidden rounded-md relative',
          thumbnailClassName
        )}
      >
        <Swiper
          id="productGallery"
          thumbs={{ swiper: thumbsSwiper }}
          modules={[Navigation, Thumbs]}
          navigation={{
            prevEl: prevRef.current!,
            nextEl: nextRef.current!,
          }}
          {...swiperParams}
        >
          {allMedia?.map((mediaUrl: string, index: number) => (
            <SwiperSlide
              key={`product-gallery-${index}`}
              className="flex items-center justify-center bg-light"
            >
              {isVideo(index) ? (
                <VideoPlayer src={mediaUrl} />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={mediaUrl || productGalleryPlaceholder.src}
                    alt={`Product gallery ${index}`}
                    width={650}
                    height={590}
                    className="object-contain max-h-[590px]"
                    unoptimized
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="flex items-center justify-between w-full absolute top-2/4 z-10 px-2.5">
          <div
            ref={prevRef}
            className="flex items-center justify-center text-base transition duration-300 transform -translate-y-1/2 rounded-full cursor-pointer w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 lg:text-lg xl:text-xl bg-brand-light hover:bg-brand hover:text-brand-light focus:outline-none shadow-navigation"
          >
            {dir === 'rtl' ? <IoIosArrowForward /> : <IoIosArrowBack />}
          </div>
          <div
            ref={nextRef}
            className="flex items-center justify-center text-base transition duration-300 transform -translate-y-1/2 rounded-full cursor-pointer w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 lg:text-lg xl:text-xl bg-brand-light hover:bg-brand hover:text-brand-light focus:outline-none shadow-navigation"
          >
            {dir === 'rtl' ? <IoIosArrowBack /> : <IoIosArrowForward />}
          </div>
        </div>
      </div>
      {/* End of product main slider */}

      <div className={`shrink-0 ${galleryClassName}`}>
        <Swiper
          id="productGalleryThumbs"
          onSwiper={setThumbsSwiper}
          spaceBetween={0}
          watchSlidesProgress={true}
          freeMode={true}
          observer={true}
          observeParents={true}
          breakpoints={galleryCarouselBreakpoints}
        >
          {allMedia?.map((mediaUrl: string, index: number) => (
            <SwiperSlide
              key={`product-thumb-gallery-${index}`}
              className="flex items-center justify-center overflow-hidden transition border rounded cursor-pointer border-border-base hover:opacity-75"
            >
              {isVideo(index) ? (
                <div className="relative w-full aspect-square">
                  <div className="absolute inset-0">
                    <video
                      className="w-full h-full object-cover"
                      src={mediaUrl}
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <BsPlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-square">
                  <Image
                    src={mediaUrl || productGalleryPlaceholder.src}
                    alt={`Product thumb gallery ${index}`}
                    width={170}
                    height={170}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ThumbnailCarousel;
