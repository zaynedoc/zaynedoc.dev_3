import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/archive",
        destination: "/works",
        permanent: true,
      },
      {
        source: "/archive/portfolio-v2/:path*",
        destination: "/works/portfolio-v2/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
