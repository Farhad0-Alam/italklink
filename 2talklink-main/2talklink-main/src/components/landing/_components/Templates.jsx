import { useState } from "react";
import { SwiperSlide, Swiper } from "swiper/react";
import { Autoplay } from "swiper/modules";
import styles from "./templates.module.css";
import { motion } from "framer-motion";
import Image from "next/image";
let templates = [{ "id": 1, "img": "/images/html_template_preview/Virtual Business Card with Social Profile Links.jpg", "alt": "Virtual Business Card with Social Profile Links" }, { "id": 2, "img": "/images/html_template_preview/Stylish and Professional Digital Business Card Layout.jpg", "alt": "Stylish and Professional Digital Business Card Layout" }, { "id": 3, "img": "/images/html_template_preview/Smart Virtual Business Card for Startup Founders.jpg", "alt": "Smart Virtual Business Card for Startup Founders" }, { "id": 4, "img": "/images/html_template_preview/Sleek NFC Digital Business Card for Networking Events.jpg", "alt": "Sleek NFC Digital Business Card for Networking Events" }, { "id": 5, "img": "/images/html_template_preview/Simple and Functional Virtual Business Card for Educators.jpg", "alt": "Simple and Functional Virtual Business Card for Educators" }, { "id": 6, "img": "/images/html_template_preview/Professional Online Contact Card Template with Email & Phone Links.jpg", "alt": "Professional Online Contact Card Template with Email & Phone Links" }, { "id": 7, "img": "/images/html_template_preview/Personal Branding Digital Contact Card for Freelancers.jpg", "alt": "Personal Branding Digital Contact Card for Freelancers" }, { "id": 8, "img": "/images/html_template_preview/Paperless Business Card Template with One Click Call Options.jpg", "alt": "Paperless Business Card Template with One Click Call Options" }, { "id": 9, "img": "/images/html_template_preview/Online Business Card Template with Social Media Integration.jpg", "alt": "Online Business Card Template with Social Media Integration" }, { "id": 10, "img": "/images/html_template_preview/Modern Web-Based Business Card for Remote Workers.jpg", "alt": "Modern Web-Based Business Card for Remote Workers" }, { "id": 11, "img": "/images/html_template_preview/Modern Digital Business Card Template for Professionals.jpg", "alt": "Modern Digital Business Card Template for Professionals" }, { "id": 12, "img": "/images/html_template_preview/Mobile Friendly Digital Business Card Template for Consultants.jpg", "alt": "Mobile Friendly Digital Business Card Template for Consultants" }, { "id": 13, "img": "/images/html_template_preview/Minimalist Virtual Business Card Design with QR Code.jpg", "alt": "Minimalist Virtual Business Card Design with QR Code" }, { "id": 14, "img": "/images/html_template_preview/Interactive Digital Visiting Card for Coaches and Consultants.jpg", "alt": "Interactive Digital Visiting Card for Coaches and Consultants" }, { "id": 15, "img": "/images/html_template_preview/High-Converting Digital Business Card for LinkedIn Sharing.jpg", "alt": "High-Converting Digital Business Card for LinkedIn Sharing" }, { "id": 16, "img": "/images/html_template_preview/Fully Customizable Mobile Business Card Design.jpg", "alt": "Fully Customizable Mobile Business Card Design" }, { "id": 17, "img": "/images/html_template_preview/Eco-Friendly Digital Business Card for Entrepreneurs.jpg", "alt": "Eco-Friendly Digital Business Card for Entrepreneurs" }, { "id": 18, "img": "/images/html_template_preview/Dynamic Online Business Card for Sales and Marketing Experts.jpg", "alt": "Dynamic Online Business Card for Sales and Marketing Experts" }, { "id": 19, "img": "/images/html_template_preview/Digital Business Identity Card for Real Estate Professionals.jpg", "alt": "Digital Business Identity Card for Real Estate Professionals" }, { "id": 20, "img": "/images/html_template_preview/Custom QR Code Business Card Template with Profile Photo.jpg", "alt": "Custom QR Code Business Card Template with Profile Photo" }, { "id": 21, "img": "/images/html_template_preview/Creative Business Card Template for Designers and Developers.jpg", "alt": "Creative Business Card Template for Designers and Developers" }, { "id": 22, "img": "/images/html_template_preview/Corporate Smart Business Card Template with NFC Features.jpg", "alt": "Corporate Smart Business Card Template with NFC Features" }, { "id": 23, "img": "/images/html_template_preview/Clickable Digital Profile Card for Personal Websites.jpg", "alt": "Clickable Digital Profile Card for Personal Websites" }, { "id": 24, "img": "/images/html_template_preview/Clean and Elegant Virtual Business Card for Business Owners.jpg", "alt": "Clean and Elegant Virtual Business Card for Business Owners" }, { "id": 25, "img": "/images/html_template_preview/Branded Digital Business Card Design for Agencies.jpg", "alt": "Branded Digital Business Card Design for Agencies" }]
export default function Templates() {
  const [landTemp, setLandTemp] = useState(templates);
  const [landTempReverse, _] = useState(templates.reverse());

  return (
    <>
      <div className={styles.templates} id="templates">
        <div className="pu_landing_templates">
          <div className={styles.main_heading}>
            <h3>Start With Creative Templates</h3>
            <strong>
              Get started with 2TalkLink to play around with these stunning
              templates.
            </strong>
          </div>
          <div className="pu_templates_slider own-slider-custom">
            <Swiper
              spaceBetween={0}
              slidesPerView={"auto"}
              loop={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={2000}
              centeredSlides={true}
              modules={[Autoplay]}
            >
              {landTemp.map((ltemp, index) => (
                <motion.div>
                  <SwiperSlide key={index}>
                    <Image
                      height={500}
                      src={ltemp.img}
                      width={300}
                      alt={ltemp?.alt || "Image"}
                      priority={true}
                    />
                  </SwiperSlide>
                </motion.div>
              ))}
            </Swiper>
          </div>
          <div className="pu_templates_slider own-slider-custom">
            <Swiper
              spaceBetween={0}
              slidesPerView={"auto"}
              loop={true}
              speed={2000}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
                reverseDirection: true,
              }}
              centeredSlides={true}
              modules={[Autoplay]}
            >
              {landTempReverse.map((ltemp, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={ltemp.img}
                    width={300}
                    height={500}
                    alt={ltemp?.alt || "Template"}
                    priority={true}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {/* <div className="text-center"><br/><br/>
              <Link href="/auth/login"><a className="pu_btn">Get Started {svg.btn_arrow_right}</a></Link>
            </div> */}
        </div>
      </div>
    </>
  );
}
