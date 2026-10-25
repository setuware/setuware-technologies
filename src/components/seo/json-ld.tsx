/**
 * Renders a JSON-LD block.
 *
 * The `<` escape keeps structured data from being able to terminate the script
 * tag early, whatever ends up in the content.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
