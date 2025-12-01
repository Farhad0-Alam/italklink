const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require("next/constants");
const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  disable: PHASE_DEVELOPMENT_SERVER,
  dest: "public",
  register: true,
  skipWaiting: false,
  runtimeCaching,
});

module.exports = (phase) => {
  // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  // when `next build` or `npm run build` is used
  const isProd =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== "1";
  // when `next build` or `npm run build` is used
  const isStaging =
    phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === "1";

  const testMode = process.env.TEST_MODE || false;

  let AppURLLocal = "http://localhost:3000/";
  let AppURLLive = testMode
    ? "https://development.2talklink.com/"
    : "https://2talklink.com/";

  let ApiUrlLocal = "http://localhost:3000/api/";
  let ApiUrlLive = testMode
    ? "https://development.2talklink.com/api/"
    : "https://2talklink.com/api/";

  const env = {
    API_URL: (() => {
      if (isDev) {
        return ApiUrlLocal;
      } else if (isProd) {
        return ApiUrlLive;
      } else if (isStaging) {
        return ApiUrlLive;
      } else {
        return "RESTURL_SPEAKERS:not (isDev,isProd && !isStaging,isProd && isStaging)";
      }
    })(),
    APP_URL: (() => {
      if (isDev) {
        return AppURLLocal;
      } else if (isProd) {
        return AppURLLive;
      } else if (isStaging) {
        return AppURLLive;
      } else {
        return "RESTURL_SPEAKERS:not (isDev,isProd && !isStaging,isProd && isStaging)";
      }
    })(),
    tableDataPerPage: isDev ? 10 : 12,
    s3URL: "https://ecardurl.s3.ap-south-1.amazonaws.com/",
    mongodburl: isDev
      ? "mongodb://root:GLpIms5n2KRnFNUxu1cB97RXE67P3i1yGkGcZdOD75hWJYDj8iIeppvi0LX7i2Mv@85.31.232.36:9101"
      : testMode
      ? "mongodb://root:GLpIms5n2KRnFNUxu1cB97RXE67P3i1yGkGcZdOD75hWJYDj8iIeppvi0LX7i2Mv@85.31.232.36:9101"
      : "mongodb://root:xspO56xBImqTmSEIz9YEQkjCprBcTs6GpvsIf9BDGBwoTQjk54vwzK2g5BPqxlk3@85.31.232.36:5432",
    dbtblPrefix: "ecard_",
    SESSION_SECRET: "s09fasd8asd98fa9as9f8",
    folderPath: __dirname,
    SITE_TITLE: "2TalkLink",
    Mandrill_key: "md-rDSHXI6GJCWr-KpR1Ed30Q",
    rules: {
      "@next/next/no-img-element": "off",
    },
    aws: {
      bucket: "ecardurl",
      configuration: {
        accessKeyId: "AKIATCKAPDWDSPI7H6AF",
        secretAccessKey: "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",
        region: "ap-south-1",
      },
    },
  };

  const nextConfig = withPWA({
    reactStrictMode: true,
    env: env,
    eslint: {
      ignoreDuringBuilds: true,
    },
    swcMinify: false,
    images: {
      domains: ["ecardurl.s3.ap-south-1.amazonaws.com"],
    },
  });

  return nextConfig;
};
