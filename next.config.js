/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "via.placeholder.com",
      "localhost",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: true,
  },
  // Enable static optimization
  output: "standalone",
  // Compress responses
  compress: true,
  // Production source maps (disable for performance)
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;