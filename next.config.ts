import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize for Vercel Hobby plan (max 12 serverless functions)
  experimental: {
    // Enable incremental static regeneration
    isrMemoryCacheSize: 50 * 1024 * 1024,
  },
};

export default nextConfig;
