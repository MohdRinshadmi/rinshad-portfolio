"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { siteConfig } from "@/lib/data";
import { staggerContainer, fadeUp, fadeIn } from "@/lib/animation";

// ⚠️ TEMPORARILY DISABLED — the 3D HeroScene pulls in three.js (~38MB / 1150 files)
// which dominates dev compile time, and renders a WebGL scene continuously at 60fps
// (even when scrolled offscreen) which pegs the CPU/GPU and hangs the system.
// Re-enable by uncommenting the import + dynamic() below and the <HeroScene /> usage.
// import dynamic from "next/dynamic";
// const HeroScene = dynamic(
//   () => import("@/components/3d/HeroScene").then((m) => m.HeroScene),
//   { ssr: false }
// );

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* TEMP: 3D HeroScene disabled (see import note above); lightweight CSS background used instead. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_30%_30%,rgba(124,58,237,0.20),transparent_70%),radial-gradient(ellipse_50%_50%_at_75%_60%,rgba(79,70,229,0.16),transparent_70%)]" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,40,200,0.18),rgba(255,255,255,0))]" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div variants={fadeIn} className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs font-medium text-violet-300">{siteConfig.availability}</span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          <span className="block">{siteConfig.fullName}</span>
          <span className="mt-2 block bg-linear-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            {siteConfig.role}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
        >
          {siteConfig.tagline}{" "}
          <span className="text-white/70">
            I craft high-performance web products with obsessive attention to detail.
          </span>
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-colors hover:bg-violet-500"
          >
            View My Work
          </motion.a>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
          >
            Get in Touch
          </motion.a>
        </motion.div>

        <motion.div
          variants={fadeIn}
          className="mt-8 flex items-center justify-center gap-5"
        >
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-zinc-500 transition-colors hover:text-white"
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-zinc-600"
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
