import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.omdbapi.com'],
  }
};

export default nextConfig;
