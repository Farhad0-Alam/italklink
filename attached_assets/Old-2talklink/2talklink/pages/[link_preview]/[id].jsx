import axios from "axios";
import PagePreview from "../../src/components/pages/PagePreview";
import Head from "next/head";

export default function PagePreviewPage({ metadata }) {
  return (
    <>
      <Head>
        {" "}
        {/* Standard Meta Tags */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image:alt" content={metadata?.title} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:url" content={metadata.url} />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
      </Head>
      <PagePreview />
    </>
  );
}

export async function getServerSideProps({ params }) {
  let metadata = {
    title: `${params?.link_preview} - 2TalkLink`,
    image: `${process.env.APP_URL}2TalkLink-Logo.png`,
    url: `${process.env.APP_URL}${params?.link_preview}/${params?.id}`,
  };

  try {
    const templateData = await axios.post(
      `${process?.env?.API_URL}preview/getTemplatePage`,
      {
        link_slug: params?.link_preview,
      }
    );
    const profileData = templateData?.data?.data?.template?.profile || null;
    if (profileData) {
      metadata = {
        ...metadata,
        title: profileData?.name,
        image: profileData?.image,
        description: profileData?.tagline,
      };
    }
  } catch {
    //
  }

  return {
    props: {
      metadata,
    },
  };
}
