import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The V3 ribbon as a PNG: the home-screen icon on
 * iOS, the PNG entry in the web manifest, and the raster logo that the
 * Organization structured data points search engines at.
 *
 * The glossy ribbon art itself, not the flat vector mark: the flat SW read
 * as a cheap redraw at this size, and the ribbon is the picked brand art.
 * The file lives in public/ so the manifest can point at it too; this
 * route just serves it at 180 px.
 */
export default function AppleIcon() {
  const png = readFileSync(join(process.cwd(), "public/images/favicon-v3-glossy-512.png"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1020" }}>
        <img
          src={`data:image/png;base64,${png.toString("base64")}`}
          width={180}
          height={180}
          alt=""
        />
      </div>
    ),
    size,
  );
}
