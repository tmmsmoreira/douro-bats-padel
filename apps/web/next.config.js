const withPWA = require("next-pwa")
const withNextIntl = require("next-intl/plugin")("./src/i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@padel/types"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {},
}

module.exports = withNextIntl(
  withPWA({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  })(nextConfig)
)
