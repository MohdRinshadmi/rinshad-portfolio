"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary — catches render/data errors below the root
 * layout, so the navbar and footer stay up while the page section recovers.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-py">
      <div className="container-page flex min-h-[60svh] flex-col items-start justify-center">
        <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-text-tertiary">
          Something broke
        </p>
        <h1 className="mt-5 max-w-[24ch] font-display text-display-lg text-text">
          This page hit an unexpected error.
        </h1>
        <p className="mt-5 max-w-[46ch] text-body-lg text-text-secondary">
          The rest of the site still works — you can retry this page or head back
          home.
        </p>
        <div className="mt-9 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full bg-text px-6 py-2.5 text-sm font-medium text-bg transition-colors duration-200 hover:bg-accent"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-border-strong hover:text-text"
          >
            Go home
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-8 font-mono text-xs text-text-muted">Ref: {error.digest}</p>
        ) : null}
      </div>
    </section>
  );
}
