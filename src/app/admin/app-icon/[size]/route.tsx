import { ImageResponse } from "next/og";

import { markSvg } from "@/lib/brand-mark";

/** App icons: the SW mark centred on navy, with padding for maskable crops. */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = raw === "512" ? 512 : 192;
  const mark = Math.round(size * 0.62);
  const svg = markSvg("dark", mark);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b1020" }}>
        <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={mark} height={mark} alt="" />
      </div>
    ),
    { width: size, height: size, headers: { "cache-control": "public, max-age=86400" } },
  );
}
