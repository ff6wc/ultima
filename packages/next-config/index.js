/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true, /** https://stackoverflow.com/questions/71075761/next-js-links-do-not-work-after-exporting-static-html */
  transpilePackages: ["@ff6wc/ff6-types", "@ff6wc/ui", "@ff6wc/utils", "@ff6wc/tailwind-config"],
};
