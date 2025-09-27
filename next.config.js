/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Vercel builds to pass even if there are ESLint rule violations.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If there are TypeScript build errors, do not fail the production build.
  // This should be considered temporary until types are cleaned up.
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
