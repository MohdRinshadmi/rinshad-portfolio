import type { CSSProperties } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/data";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * HeroSlideshow — a vertical, infinitely-looping slideshow of softly-blurred
 * project thumbnails behind a single "View all projects" CTA.
 *
 * Pure CSS `translateY` marquee → compositor-only, 60fps, no JS/rAF, and it
 * pauses for `prefers-reduced-motion`. Two identical stacked blocks loop
 * seamlessly (translate -50%). The slow duration + linear timing keep it buttery.
 * Swap the picsum `src` for real `/public` screenshots later.
 */
function Thumb({ project }: { project: Project }) {
  const src = `https://picsum.photos/seed/${project.slug}/760/1000?grayscale`;
  return (
    <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg border border-border bg-bg-subtle">
      <Image
        src={src}
        alt={`${project.title} preview`}
        fill
        unoptimized
        sizes="(min-width: 1024px) 40rem, 92vw"
        // clear by default; blurs (+ a slight zoom to hide the blur edge) on hover
        className="object-cover transition duration-500 ease-out group-hover:scale-105 group-hover:blur-[3px]"
      />
    </div>
  );
}

function Block({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex flex-col gap-4 pb-4" aria-hidden={hidden || undefined}>
      {projects.map((project) => (
        <Thumb key={project.slug} project={project} />
      ))}
    </div>
  );
}

export function HeroSlideshow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "group relative h-[clamp(28rem,52vw,48rem)] w-full overflow-hidden rounded-xl",
        className,
      )}
    >
      {/* blurred scrolling images — edge-faded, transform-only @60fps, slow + smooth */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent_0%,#000_8%,#000_82%,transparent_100%)]">
        <div
          className="flex flex-col will-change-transform animate-marquee-y motion-reduce:animate-none"
          style={{ "--marquee-duration": "46s" } as CSSProperties}
        >
          <Block />
          <Block hidden />
        </div>
      </div>

      {/* CTA overlay — black pill sitting on top of the soft images */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <Button
          href="/work"
          variant="primary"
          size="lg"
          className="pointer-events-auto animate-fade-pulse hover:animate-none motion-reduce:animate-none"
          iconRight={<ArrowUpRight className="size-4" />}
        >
          View all projects
        </Button>
      </div>
    </div>
  );
}
