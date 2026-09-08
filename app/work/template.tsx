import { PageTransition } from "@/components/motion/PageTransition";

/** Covers /work → /work/[slug]: the root template keys on the first segment,
    so its key stays "/work" and it does not remount for the child route. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
