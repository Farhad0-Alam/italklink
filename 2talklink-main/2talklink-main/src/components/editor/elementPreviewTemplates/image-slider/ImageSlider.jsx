import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// Import required modules
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import Image from "next/image";

export default function ImageSlider(props) {
  const { item } = props || {};
  const { sliderImages } = item || {};

  const images = sliderImages || [];
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0); // Selected image index

  // Calculate slidesPerView dynamically
  const getSlidesPerView = () => {
    if (images.length === 1) return 1;
    if (images.length === 2) return 2;
    if (images.length >= 5) return 5;
    return images.length;
  };

  const slidesPerView = getSlidesPerView();

  return (
    <div>
      {/* Main Swiper (for full-size images) */}
      <Swiper
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        loop={true}
        spaceBetween={10}
        navigation={true}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mainSwiper"
        onSlideChange={(swiper) => setSelectedIndex(swiper.realIndex)} // Update selected image index
      >
        {images?.map(({ id, image }) => (
          <SwiperSlide key={id}>
            <Image
              src={image}
              alt={`slide-${id}`}
              height={230}
              width={355}
              priority={true}
              layout="responsive"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "10px",
                objectFit: "cover",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Swiper (for navigation thumbnails) */}
      <Swiper
        onSwiper={(swiper) => {
          if (swiper && !swiper.destroyed) {
            setThumbsSwiper(swiper);
          }
        }}
        loop={true}
        spaceBetween={10}
        slidesPerView={slidesPerView}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbSwiper"
      >
        {images?.map(({ id, image }, index) => (
          <SwiperSlide key={id} onClick={() => setSelectedIndex(index)}>
            <Image
              height={45}
              width={65}
              src={image}
              priority={true}
              alt={`thumb-${id}`}
              style={{
                width: "100%",
                height: "auto",
                cursor: "pointer",
                transition: "filter 0.3s ease-in-out",
                filter: selectedIndex === index ? "blur(1px)" : "none",
                borderRadius: "5px",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
