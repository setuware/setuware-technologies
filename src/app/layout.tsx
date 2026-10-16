import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Setuware Technologies",
    default: "Setuware Technologies — Next-Gen Digital Solutions",
  },
  description:
    "Setuware Technologies builds high-performance web applications, AI solutions, and digital products for modern startups and enterprises.",
  keywords: [
    "Setuware Technologies",
    "web development",
    "AI solutions",
    "Next.js",
    "startup",
    "digital agency",
    "software development",
  ],
  authors: [{ name: "Setuware Technologies" }],
  openGraph: {
    title: "Setuware Technologies — Next-Gen Digital Solutions",
    description:
      "Setuware Technologies builds high-performance web applications, AI solutions, and digital products.",
    type: "website",
    locale: "en_US",
    url: "https://setuware.com",
    siteName: "Setuware Technologies",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Setuware Technologies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Setuware Technologies — Next-Gen Digital Solutions",
    description:
      "Setuware Technologies builds high-performance web applications, AI solutions, and digital products.",
    images: ["/og-image.jpg"],
    creator: "@setuware",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
