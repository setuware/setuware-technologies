"use client";

/**
 * Last-resort boundary for failures in the root layout itself.
 *
 * It replaces the whole document, so it ships its own <html>/<body> and uses
 * inline styles — the stylesheet may be exactly what failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#070910",
          color: "#f3f5fb",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.6rem", margin: "0 0 0.75rem" }}>
            Setuware Technologies is temporarily unavailable
          </h1>
          <p style={{ color: "#9aa3b8", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
            We hit an unexpected error loading the site. Reloading usually fixes
            it. If not, email hello@setuwaresoftware.in
            {error.digest ? ` and quote ${error.digest}.` : "."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#4f46e5",
              color: "white",
              border: 0,
              borderRadius: "0.75rem",
              padding: "0.75rem 1.5rem",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
