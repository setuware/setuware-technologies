import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: "Setuware",
    description: site.description,
    start_url: "/",
    lang: "en-IN",
    display: "standalone",
    background_color: "#070910",
    theme_color: "#2f56d8",
    categories: ["business", "productivity"],
    icons: [
      { src: "/images/favicon-v3-glossy-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
