import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Root template — remounts whenever the FIRST path segment changes, i.e. every
 * navigation from the header (Work · About · Writing · Contact) and the footer.
 * Drilling into /work/[slug] or /blog/[slug] keeps this key, so those segments
 * carry their own template.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
