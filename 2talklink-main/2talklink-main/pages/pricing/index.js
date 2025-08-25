import Link from "next/link";
import { useRef } from "react";
import PricingPlan from "../../src/components/common/pricingPlan";
import Header from "../../src/components/landing/_components/Header";
import Footer from "../../src/components/landing/_components/Footer";

export default function Plan() {
  return (
    <>
      <Header customBackground={"#f8fafd"} />
      <PricingPlan />
      <Footer />
    </>
  );
}
