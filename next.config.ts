import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const noIndexHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ];

    return [
      {
        source: "/resume",
        headers: noIndexHeaders,
      },
      {
        source: "/Zayne_Dockery_Resume.pdf",
        headers: noIndexHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/work",
        destination: "/works",
        permanent: true,
      },
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
