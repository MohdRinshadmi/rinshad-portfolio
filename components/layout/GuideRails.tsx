/**
 * GuideRails — the page-wide editorial frame. Two full-height vertical dashed rails
 * at the `container-wide` content edges, drawn as a non-interactive overlay *above*
 * section background bands so they read as one continuous frame down the whole page
 * (the hero's old self-contained box only framed the hero).
 *
 * Bounded to <main> via `absolute inset-0`, so it spans every section but stops short
 * of the footer. Shown only at xl+, where the wide frame clears the narrower
 * `container-page` section content with a comfortable gutter (below xl the rails would
 * land on content edges, so sections keep their own local framing instead).
 */
export function GuideRails() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 hidden xl:block"
    >
      <div className="container-wide h-full">
        <div className="h-full border-x border-dashed border-border-strong" />
      </div>
    </div>
  );
}
