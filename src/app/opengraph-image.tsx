import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, generated at build time by the file convention so every route
 * inherits it. Keeping it as code rather than a checked-in PNG means the
 * wording can never drift from the site copy.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #0e7490 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Websites that turn visitors into enquiries.
          </div>
          <div style={{ fontSize: 28, color: "rgba(255,255,255,0.78)", maxWidth: 880 }}>
            Business websites · E-commerce · Apps · SEO · Custom software
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            fontSize: 22,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>{site.sla.uptime} uptime SLA</span>
          <span>Fixed-price scopes</span>
          <span>setuwaresoftware.in</span>
        </div>
      </div>
    ),
    size,
  );
}
