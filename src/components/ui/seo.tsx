import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  pathname?: string;
}

export function SEO({ title, description, image, pathname }: SEOProps): Metadata {
  const baseUrl = "https://setuware.com";
  const pageUrl = `${baseUrl}${pathname || ""}`;

  return {
    title: title ? `${title} | Setuware Technologies` : undefined,
    description,
    openGraph: {
      title: title ? `${title} | Setuware Technologies` : undefined,
      description,
      type: "website",
      url: pageUrl,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | Setuware Technologies` : undefined,
      description,
      images: image ? [image] : undefined,
    },
  };
}
