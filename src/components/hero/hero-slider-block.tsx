import HeroBannerCard from '@components/hero/hero-banner-card';
import Carousel from '@components/ui/carousel/carousel';
import { SwiperSlide } from '@components/ui/carousel/slider';
import HeroSearchBox from './hero-banner-search';

interface Props {
  heroBanner?: any;
  className?: string;
  contentClassName?: string;
}

const HeroSliderBlock: React.FC<Props> = ({
  heroBanner,
  className = 'mb-7',
  contentClassName = 'py-24',
}) => {
  return (
    <div className={`${className} relative`}>
      <div className="absolute z-10 w-full flex justify-center" style={{ top: '65%' }}>
        <div className="hidden lg:flex w-full max-w-[650px] 2xl:max-w-[850px] mx-auto px-6">
          <HeroSearchBox />
        </div>
      </div>
      <Carousel
        pagination={{
          clickable: true,
        }}
        navigation={false}
        autoplay={{
          delay: 15000, // 1 minute delay
          disableOnInteraction: false,
        }}
      >
        {heroBanner?.map((banner: any) => (
          <SwiperSlide key={`banner--key${banner.id}`}>
            <HeroBannerCard
              banner={{ ...banner, searchBox: false }}
              variant="default"
              className={contentClassName}
            />
          </SwiperSlide>
        ))}
      </Carousel>
    </div>
  );
};

export default HeroSliderBlock;
