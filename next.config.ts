import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * The CSP allows `'unsafe-inline'` for styles because Tailwind and our inline
 * `style` attributes need it; scripts are restricted to self plus the inline
 * bootstrap Next emits (`'unsafe-inline'` is ignored by browsers that honour
 * `strict-dynamic`, and Next's own nonce support is the upgrade path if you
 * later add third-party scripts).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self'",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Trim the response on the way out; a CDN in front will usually do better,
  // but this covers self-hosted deployments.
  compress: true,
  poweredByHeader: false,

  images: {
    // AVIF first, WebP second: both are far smaller than JPEG at equal quality.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Keep icon imports from pulling the whole library into a chunk.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  turbopack: {
    // Pin the workspace root; otherwise Turbopack walks up and picks up an
    // unrelated lockfile outside the repository.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // `/_next/static/*` is left alone on purpose: Next already serves it
      // immutable, and overriding it breaks dev-time revalidation.
      {
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
