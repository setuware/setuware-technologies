import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The brand mark from `public/icon.svg` as a PNG: the home-screen icon on
 * iOS, the PNG entry in the web manifest, and the raster logo that the
 * Organization structured data points search engines at.
 */
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="180" height="180"><defs><linearGradient id="g" x1="6" y1="8" x2="34" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5fe0f7"/><stop offset="1" stop-color="#00a1c6"/></linearGradient></defs><rect width="40" height="40" fill="#0b1020"/><path d="M18.6 13.4C17.4 11.4 15.5 10.4 13.3 10.4 10.3 10.4 8.3 12.2 8.3 14.5c0 5.3 10.6 3.5 10.6 9.3 0 2.4-2.2 4.3-5.4 4.3-2.4 0-4.4-1.1-5.6-3.1" fill="none" stroke="url(#g)" stroke-width="3.6" stroke-linecap="round"/><path d="M22 11.2h10.6M27.3 11.2v16.9" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0b1020" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
        <img
          src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`}
          width={180}
          height={180}
          alt=""
        />
      </div>
    ),
    size,
  );
}
