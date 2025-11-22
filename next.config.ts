import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests for development
  allowedDevOrigins: [
    "cmiadv38u021lpsiljyqzu9jy.preview.machines.compyle.ai",
    "*.preview.machines.compyle.ai"
  ],
  // Additional configuration for development
  experimental: {
    // Enable more aggressive compilation for development
    optimizeCss: true
  }
};

export default nextConfig;
