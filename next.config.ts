import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/acquire", destination: "/market", permanent: false },
      { source: "/startup/:slug", destination: "/product/:slug", permanent: false },
      { source: "/startup/:slug/edit", destination: "/product/:slug/edit", permanent: false },
    ];
  },
};

export default nextConfig;
