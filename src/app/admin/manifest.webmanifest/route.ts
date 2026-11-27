import { pwaScope } from "@/lib/portal";

/** Web app manifest for the admin portal (installable on phones and desktops). */
export function GET(request: Request) {
  return Response.json(
    {
      id: "/admin",
      name: "Setuware Admin",
      short_name: "Setuware",
      description: "Leads, enquiries, content and hiring for Setuware Technologies.",
      start_url: "/admin",
      scope: pwaScope(request.headers.get("host")),
      display: "standalone",
      orientation: "any",
      background_color: "#0b1020",
      theme_color: "#0b1020",
      categories: ["business", "productivity"],
      icons: [
        { src: "/admin/app-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/admin/app-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/admin/app-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
      shortcuts: [
        { name: "CRM leads", url: "/admin/leads" },
        { name: "Enquiries", url: "/admin/enquiries" },
        { name: "New blog post", url: "/admin/posts/new" },
      ],
    },
    { headers: { "content-type": "application/manifest+json", "cache-control": "public, max-age=3600", vary: "host" } },
  );
}
