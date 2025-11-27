import Layout from "../src/components/Layout";
import "../styles/globals.css";
import "../styles/fonts.css";
import "../styles/landing.css";
import "../styles/ui/modal.css";
import "../styles/ui/shareButton.css";
import "react-quill/dist/quill.snow.css";

import { store, persistor } from "../src/redux/store";
import { Provider } from "react-redux";
import NextNProgress from "nextjs-progressbar";
import { PersistGate } from "redux-persist/integration/react";
import Head from "next/head";
store.subscribe(() => console.log(/* store.getState() */));

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <NextNProgress color="#f9913a" height={2} showOnShallow={true} />
      {Component?.name === "HomePage" && (
        <Head>
          <meta
            name="description"
            content="What if you had a digital all-in-one business card that helps your target audience effortlessly find and engage with your online presence? TalkLink offers premium-quality digital business cards to revolutionize the way you connect and grow your business."
          />
          <meta property="og:title" content="2TalkLink" />
          <meta
            property="og:description"
            content="What if you had a digital all-in-one business card that helps your target audience effortlessly find and engage with your online presence? TalkLink offers premium-quality digital business cards to revolutionize the way you connect and grow your business."
          />
          <meta
            property="og:image"
            content={`${process.env.APP_URL}2TalkLink-Logo.png`}
          />
          <meta property="og:image:alt" content={"2Talk Link"} />
          <meta property="og:url" content={process?.env?.APP_URL} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={"2TalkLink"} />
          <meta
            name="twitter:description"
            content={
              "What if you had a digital all-in-one business card that helps your target audience effortlessly find and engage with your online presence? TalkLink offers premium-quality digital business cards to revolutionize the way you connect and grow your business."
            }
          />
          <meta
            name="twitter:image"
            content={`${process.env.APP_URL}2TalkLink-Logo.png`}
          />
        </Head>
      )}
      {Component?.name === "PreviewTemplatePage" ||
      Component?.name === "PagePreviewPage" ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <PersistGate loading={null} persistor={persistor}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PersistGate>
      )}
    </Provider>
  );
}

export default MyApp;
