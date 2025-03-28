import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // ✅ Enable strict mode
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY, // ✅ Expose API key to Next.js
  },
};

export default nextConfig;