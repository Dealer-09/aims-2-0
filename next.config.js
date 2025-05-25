/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimized production output
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable compression
  // Environment variables are automatically loaded from .env files
  // Do not expose sensitive variables here!
  env: {
    // Only expose necessary client-side variables here
    // Server-side variables should use process.env directly in API routes
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
