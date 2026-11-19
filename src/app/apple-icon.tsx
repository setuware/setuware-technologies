import { ImageResponse } from "next/og";

import { markSvg } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The V3 ribbon SW on navy as a PNG: the home-screen icon on
 * iOS, the PNG entry in the web manifest, and the raster logo that the
 * Organization structured data points search engines at.
 *
 * Navy, not white: the old white tile carried the ringed monogram, which
 * read as the old logo at small sizes. The dark tile matches the favicon
 * chip and the admin app icons.
 */
const MARK = markSvg("dark", 150);

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1020" }}>
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
