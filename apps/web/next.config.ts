import type { NextConfig } from "next"

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
}

export default nextConfig
