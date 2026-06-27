import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css"; // Import Swiper styles
import Image from "next/image";

export default function CarouselComponent({ property }) {
  return (
    <Swiper
      spaceBetween={15}
      pagination={{
        clickable: true,
      }}
      modules={[Pagination]}
      className="places-slides"
    >
      {property.ListImages.map((_, index) => (
        <SwiperSlide key={index}>
          <div className="single-places-box">
            <div className="image-container">
              <Image
                className="property-image"
                // src={`https://realestatedigital.propertiescdn.com/ListingImages/mdbmls/addl_picts/1/0/${property.ListingId}-${index}.jpg`}
                src={_}
                alt={`${property.UnparsedAddress} - ${property.ListingId}`}
                width={1920/2}
                height={1080/2}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}