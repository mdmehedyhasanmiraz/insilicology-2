import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Suppress Supabase realtime-js dynamic require warning
  webpack(config) {
    config.ignoreWarnings = [
      {
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
  images: {
    domains: ['cdn.sanity.io', 'cdn.sanity.imageurl.com', 'gkuzvdwhqbxbgrqewlbu.supabase.co', 'i.ytimg.com', 'img.youtube.com'],
  },
};

export default withNextVideo(nextConfig);