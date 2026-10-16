import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://setuwaresoftware.in"),
  title: {
    template: "%s | Setuware Technologies",
    default: "Setuware Technologies — Production-Ready Software",
  },
  description:
    "Setuware Technologies builds production-ready software from ideas to deployment. Web applications, AI solutions, and digital products for modern businesses.",
  keywords: [
    "Setuware Technologies",
    "web development",
    "AI solutions",
    "software development",
    "startup",
    "digital agency",
  ],
  authors: [{ name: "Setuware Technologies" }],
  openGraph: {
    title: "Setuware Technologies — Production-Ready Software",
    description:
      "Setuware Technologies builds production-ready software from ideas to deployment.",
    type: "website",
    locale: "en_IN",
    url: "https://setuwaresoftware.in",
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
    title: "Setuware Technologies — Production-Ready Software",
    description:
      "Setuware Technologies builds production-ready software from ideas to deployment.",
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
      <body className="min-h-full flex flex-col selection:bg-blue-500/20">
        {children}
      </body>
    </html>
  );
}
