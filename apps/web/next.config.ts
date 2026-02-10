import type { NextConfig } from "next"
import withPWA from "next-pwa"

const nextConfig: NextConfig = {
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

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig)
