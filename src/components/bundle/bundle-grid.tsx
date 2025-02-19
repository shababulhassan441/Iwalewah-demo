import BundleCard from '@components/cards/bundle-card';
import dynamic from 'next/dynamic';
import { SwiperSlide } from '@components/ui/carousel/slider';
import { ROUTES } from '@utils/routes';
import { Autoplay } from 'swiper';
import cn from 'classnames';

const Carousel: any = dynamic(() => import('@components/ui/carousel/carousel'), {
  ssr: false,
});

interface Props {
  className?: string;
  data: any;
}

const breakpoints = {
  '0': {
    slidesPerView: 1,
  },
  '680': {
    slidesPerView: 2,
    spaceBetween: 12,
  },
  '768': {
    slidesPerView: 2,
    spaceBetween: 16,
  },
  '1024': {
    slidesPerView: 3,
    spaceBetween: 16,
  },
  '1536': {
    slidesPerView: 4,
    spaceBetween: 16,
  },
  '1920': {
    slidesPerView: 5,
    spaceBetween: 16,
  },
};

const BundleGrid: React.FC<Props> = ({ className = 'mb-12 pb-0.5', data }) => {
  return (
    <div className={cn('relative heightFull', className)}>
      <Carousel
        breakpoints={breakpoints}
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        navigation
      >
        {data?.map((item: any) => (
          <SwiperSlide key={`bundle-key-${item.id}`}>
            <BundleCard
              bundle={item}
              href={`${ROUTES.BUNDLE}/${item.slug}`}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
};

export default BundleGrid;
