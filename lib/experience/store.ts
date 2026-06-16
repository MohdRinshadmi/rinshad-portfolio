"use client";

import { create } from "zustand";
import type { Capabilities, QualityTier } from "./capabilities";

/* ============================================================================
   EXPERIENCE STORE — single zustand store for cross-scene state.
   Scenes subscribe to slices (never the whole store) so a dialog opening in
   the command center can't re-render the hero particle field.
   ========================================================================== */

interface ExperienceState {
  /** null until detection runs on the client (SSR-safe initial). */
  tier: QualityTier | null;
  reducedMotion: boolean;
  dpr: [number, number];
  setCapabilities: (caps: Capabilities) => void;

  /** Command-center dialog — slug of the open project module. */
  activeProject: string | null;
  openProject: (slug: string) => void;
  closeProject: () => void;

  /** Timeline corridor — index of the milestone nearest the camera. */
  activeMilestone: number;
  setActiveMilestone: (index: number) => void;

  /** Achievement vault — ids unlock once as the visitor explores. */
  unlocked: Record<string, true>;
  unlock: (id: string) => void;
}

export const useExperience = create<ExperienceState>()((set) => ({
  tier: null,
  reducedMotion: false,
  dpr: [1, 1.5],
  setCapabilities: (caps) =>
    set({ tier: caps.tier, reducedMotion: caps.reducedMotion, dpr: caps.dpr }),

  activeProject: null,
  openProject: (slug) => set({ activeProject: slug }),
  closeProject: () => set({ activeProject: null }),

  activeMilestone: 0,
  setActiveMilestone: (index) => set({ activeMilestone: index }),

  unlocked: {},
  unlock: (id) =>
    set((s) => (s.unlocked[id] ? s : { unlocked: { ...s.unlocked, [id]: true } })),
}));
