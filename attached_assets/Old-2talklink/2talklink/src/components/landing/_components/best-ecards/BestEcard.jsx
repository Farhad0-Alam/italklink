import Card from "./Card";
import styles from "./BestEcard.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useRef } from "react";
const bestEcards = [
    {
        "id": 1,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/681f721445a1ab058acd6b41/templates/681f73f445a1ab058acd6ba3/e651a5a7-3ed4-4887-9f99-c89b495bc131.png",
        "background": "#568c27",
        "username": "data-first-services",
        "link": "https://2talklink.com/data-first-services",
        "rounded": "40px",
        "width": "373px",
        "alt": "IT Services and IT Consulting"
    },
    {
        "id": 2,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/6809d8bd76760445cf6e69d7/templates/6809d98876760445cf6e6a94/aea68f8b-ba5e-4a6d-a37c-8103ab3dcf25.png",
        "background": "#172726",
        "username": "melodynavarro",
        "link": "https://2talklink.com/melodynavarro",
        "rounded": "40px",
        "width": "373px",
        "alt": "Account Concierge"
    },
    {
        "id": 3,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/681d041fc1f967e640fd6fa9/templates/681d049ac1f967e640fd7007/f70e4869-56c3-4269-b218-99826c745494.png",
        "background": "#fdf1ed",
        "username": "sergionavarrete",
        "link": "https://2talklink.com/sergionavarrete",
        "rounded": "40px",
        "width": "373px",
        "alt": "Customized Solutions for All of Your Real Estate Investment Needs"
    },
    {
        "id": 5,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/67ef9aff0e12987881b137a6/templates/67ef9c8a0e12987881b13805/7a4135d8-bf49-40ab-a1f8-16af55ba3324.png",
        "background": "#d95b07",
        "username": "whatsthatyougoton",
        "link": "https://2talklink.com/whatsthatyougoton",
        "rounded": "40px",
        "width": "373px",
        "alt": "Keep them guessing with what you got on"
    },
    {
        "id": 4,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/67e78c24a60ee788f90f3eb4/templates/67e78ea8a60ee788f90f3f9e/8767b646-7c3b-45ef-b5ba-e6c7dfb714f3.png",
        "background": "#952870",
        "username": "trilliontheory",
        "link": "https://2talklink.com/trilliontheory",
        "rounded": "40px",
        "width": "373px",
        "alt": "Trillion Theory is a problem-solving studio that blends strategic thinking, innovation, and execution to bring ambitious ideas to life."
    },
    {
        "id": 6,
        "img": "https://ecardurl.s3.ap-south-1.amazonaws.com/usercontent/67de601bf504a8f009eeef41/templates/67de60abf504a8f009eef02e/2767fa1f-61ae-4724-aa47-5587363d9ee8.png",
        "background": "#181786",
        "username": "engelsdeleon",
        "link": "https://2talklink.com/engelsdeleon",
        "rounded": "40px",
        "width": "373px",
        "alt": " I’m passionate about helping you find not just a house, but a place to call home. Whether you're buying, selling, or investing, I offer expert guidance, honest advice, and a stress-free experience tailored to your unique needs. Real estate is more than a transaction—it’s a journey, and I’m here to walk it with you every step of the way. Let’s make your real estate dreams a reality!"
    }
]
export default function BestEards() {
  const swiperRef = useRef(null);
  return (
    <section className={styles.bestEcardSection}>
      <div className={styles.bestEcardContainer}>
        <div className="pu_container">
          <div className={`v2_header_new`}>
            <h2>
              A lot of Business Owners already trust 2TalkLink.{" "}
              <span style={{ color: "#ff6f61" }}> Are you next?</span>
            </h2>
          </div>
        </div>
      </div>
      <div className="pu_templates_slider best-ecard-slider">
        <Swiper
          ref={swiperRef}
          spaceBetween={0}
          slidesPerView={"auto"}
          
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={2500}
          centeredSlides={true}
          modules={[Autoplay]}
        >
          {bestEcards.map((ecard, index) => (
            <SwiperSlide
              key={index}
              style={{ width: "unset", maxWidth: "unset" }}
            >
              <Card ecard={ecard} swiperRef={swiperRef} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
