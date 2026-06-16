import { Prologue } from "@/components/story/Prologue";
import { TheBuilder } from "@/components/story/TheBuilder";
import { BehindTheInterfaces } from "@/components/story/BehindTheInterfaces";
import { SystemsCanvas } from "@/components/story/SystemsCanvas";
import { WorkStories } from "@/components/story/WorkStories";
import { Principles } from "@/components/story/Principles";
import { Epilogue } from "@/components/story/Epilogue";

/**
 * Homepage — "an engineering documentary" in five chapters.
 * Prologue (the statement + living artifact) → The Builder → Behind the
 * Interfaces (horizontal case study) → Systems Thinking (drawn architecture)
 * → Selected Work (magazine features) → Principles → Epilogue (the ending).
 * The Builder closes on the full-bleed proof band (count-up stats).
 */
export default function Home() {
  return (
    <>
      <Prologue />
      {/* <TheBuilder /> */}
      <BehindTheInterfaces />
      <SystemsCanvas />
      <WorkStories />
      <Principles />
      <Epilogue />
    </>
  );
}
