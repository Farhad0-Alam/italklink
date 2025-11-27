import Head from "next/head";
import Landing from "../src/components/landing/landing";
import OldLandingPage from "../src/components/landing/old";
import styles from "../styles/pages/LandingPage.module.css";
import Script from "next/script";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>
          2TalkLink - Connect And Manage All Your Social Links At One Place
        </title>
      </Head>
      <div className={styles.wrapper}>
        {/* <OldLandingPage /> */}
        <Landing />
      </div>
      <Script
        id="tawkto"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/681b17653913ed190aa122e3/1iqkt6q5h';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `,
        }}
      />
    </>
  );
}
