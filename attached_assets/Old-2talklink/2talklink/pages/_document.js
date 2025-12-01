import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* <link rel="manifest" href="/manifest.json" /> */}
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
          <link rel="manifest" href="/api/manifest" />
          <link rel="apple-touch-icon" href="/logo.png"></link>
          <meta name="theme-color" content="#fff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
