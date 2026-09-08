import { PageTransition } from "@/components/motion/PageTransition";

/** Covers /blog → /blog/[slug]: the root template keys on the first segment,
    so its key stays "/blog" and it does not remount for the child route. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
