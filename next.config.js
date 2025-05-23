/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized production output
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  env: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    // Needed for the Resend package
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'fs': false,
      'net': false,
      'tls': false,
    };
    return config;
  },  // Production optimizations
}

module.exports = nextConfig
