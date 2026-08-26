import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  allowedDevOrigins: [
    "than-struct-elimination-portsmouth.trycloudflare.com",
    "animals-permit-employment-trends.trycloudflare.com",
    "crawford-accomplished-visible-makeup.trycloudflare.com",
    "decent-pilot-eye-picture.trycloudflare.com",
    "*.trycloudflare.com",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
