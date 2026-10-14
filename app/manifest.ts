import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "us.",
    short_name: "us.",
    description: "One thing a day, for the two of us.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ed",
    theme_color: "#f6f3ed",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
