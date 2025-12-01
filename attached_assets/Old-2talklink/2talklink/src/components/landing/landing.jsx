import BestEards from "./_components/best-ecards/BestEcard";
import FAQ from "./_components/FAQ";
import CoreFeatures from "./_components/CoreFeaturesSection";
import Header from "./_components/Header";
import Hero from "./_components/Hero";
import Features from "./_components/Features";
import Templates from "./_components/Templates";
import EcardPlayground from "./ecard-playground/EcardPlayground";
import Footer from "./_components/Footer";
import HowItWork from "./_components/HowItWork";

export default function Landing() {
  return (
    <>
      <Header />
      <Hero />
      <CoreFeatures />
      <Templates />
      <HowItWork />
      <EcardPlayground />
      <BestEards />
      <Features />
      <FAQ />
      <Footer />
    </>
  );
}
