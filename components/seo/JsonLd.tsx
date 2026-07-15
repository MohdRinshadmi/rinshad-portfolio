import { jsonLdScript } from "@/lib/seo";

/**
 * Inline a JSON-LD payload. Server component — renders a single
 * <script type="application/ld+json"> with XSS-safe serialization.
 * Pass a full graph document (`graph(...)`, `coreGraph()`, or `*JsonLd()`).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
