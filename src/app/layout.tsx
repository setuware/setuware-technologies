import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { organizationJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { mobileServices, navLinks } from "@/components/layout/nav-menu-data";
import { ThemeProvider } from "@/components/layout/theme";
import { DeferredWidgets } from "@/components/layout/deferred-widgets";

import "./globals.css";

/**
 * `display: swap` plus a preconnect-free self-hosted subset: text is readable
 * on the first paint instead of waiting on a font download.
 */
/** Manrope is the only typeface in the Figma design (weights 400–800). */
const inter = Manrope({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800"],
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s | ${site.name}`,
    default: `${site.name} — ${site.tagline}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "web development company",
    "app development India",
    "managed hosting",
    "Next.js development agency",
    "software maintenance support",
    "AI integration services",
    "Setuware Technologies",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image", creator: "@setuware" },
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
  formatDetection: { telephone: true, address: false, email: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#070910" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the theme class is applied before React
    // hydrates, which is what prevents a flash of the wrong theme.
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
<Navbar links={navLinks} services={mobileServices} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <DeferredWidgets />
        </ThemeProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
