import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";

import { DEFAULT_OG_IMAGE, HOME_DESCRIPTION, HOME_TITLE, organizationJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/json-ld";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { navLinks } from "@/components/layout/nav-menu-data";
import { ThemeProvider } from "@/components/layout/theme";
import { DeferredWidgets } from "@/components/layout/deferred-widgets";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { MotionProvider } from "@/components/motion/motion-provider";

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

/** Brand wordmark only (logo). */
const brand = Sora({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["500", "600", "700", "800"],
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

/**
 * Site-wide defaults. Every page overrides title, description, canonical and
 * social card through `pageMetadata` (src/lib/seo.ts); these cover anything
 * that does not, such as error pages.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    template: `%s | ${site.name}`,
    default: HOME_TITLE,
  },
  description: HOME_DESCRIPTION,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
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
  // Google Search Console HTML-tag verification; omitted when the env is unset.
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  formatDetection: { telephone: true, address: false, email: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1020" },
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
      // Lets Next.js switch off CSS smooth scrolling while it moves a new
      // page to the top; without it pages open at the previous position.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${brand.variable}`}
    >
      <body
        className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased"
        // Browser extensions (password managers, Bitdefender, Grammarly) add
        // attributes to <body> before React hydrates; ignore those diffs here.
        suppressHydrationWarning
      >
        <ThemeProvider>
          <MotionProvider>
            <Navbar links={navLinks} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <DeferredWidgets />
            <SmoothScroll />
          </MotionProvider>
        </ThemeProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
