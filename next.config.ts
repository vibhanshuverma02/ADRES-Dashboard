import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,  // ✅ disable to prevent double renders
  basePath: isProd ? "/dashboard" : "",
  assetPrefix: isProd ? "/dashboard" : "",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/dashboard" : "",
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "node_modules")],
  },
  // ✅ Fix RSC payload fetch behind reverse proxy
  experimental: {
    serverActions: {
      allowedOrigins: ["adresnetwork.iitr.ac.in", "13.203.206.32"],
    },
  },
  // ✅ Fix RSC fetch URL behind Nginx proxy
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;