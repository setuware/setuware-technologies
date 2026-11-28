import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { absolute: "Setuware Core · Setuware Technologies" },
  robots: { index: false, follow: false, nocache: true },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Setuware Core", statusBarStyle: "black-translucent" },
  icons: { apple: "/admin/app-icon/192" },
};

export const viewport: Viewport = { themeColor: "#0b1020" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
