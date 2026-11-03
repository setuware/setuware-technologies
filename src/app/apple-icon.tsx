import { ImageResponse } from "next/og";

import { markSvg } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The SW brand mark on white as a PNG: the home-screen icon on
 * iOS, the PNG entry in the web manifest, and the raster logo that the
 * Organization structured data points search engines at.
 */
const MARK = markSvg("light", 150);

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`}
          width={150}
          height={150}
          alt=""
        />
      </div>
    ),
    size,
  );
}
