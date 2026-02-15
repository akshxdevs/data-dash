import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV === "development";
    const frameAncestors = isDev ? "*" : "'self'";

    const headers = [
      {
        key: "Content-Security-Policy",
        value: `frame-ancestors ${frameAncestors};`,
      },
    ];

    if (!isDev) {
      headers.push({
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

export default nextConfig;
