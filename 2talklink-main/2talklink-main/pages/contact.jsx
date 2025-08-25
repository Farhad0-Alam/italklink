import ContactForm from "../src/components/common/contact/ContactForm";
import FooterBottom from "../src/components/landing/_components/FooterBottom";
import Header from "../src/components/landing/_components/Header";

export default function contact() {
  return (
    <>
      <Header customBackground={"#191b31"} />
      <ContactForm />
      <FooterBottom />
    </>
  );
}
