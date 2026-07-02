import Link from "next/link";

/** 404 — rendered inside the root layout (navbar/footer intact). */
export default function NotFound() {
  return (
    <section className="section-py">
      <div className="container-page flex min-h-[60svh] flex-col items-start justify-center">
        <p className="font-serif text-[4rem] italic leading-none text-accent">404</p>
        <h1 className="mt-6 max-w-[24ch] font-display text-display-lg text-text">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-5 max-w-[46ch] text-body-lg text-text-secondary">
          The link may be old, or the page may have moved. The work, writing, and
          contact pages are all still here.
        </p>
        <div className="mt-9 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-text px-6 py-2.5 text-sm font-medium text-bg transition-colors duration-200 hover:bg-accent"
          >
            Go home
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:border-border-strong hover:text-text"
          >
            View work
          </Link>
        </div>
      </div>
    </section>
  );
}
