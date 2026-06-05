import { Hero } from "@/components/sections/Hero";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Capabilities } from "@/components/sections/Capabilities";
import { AINativeSignature } from "@/components/sections/AINativeSignature";
import { ExperienceTimeline } from "@/components/sections/ExperienceTimeline";
import { Testimonials } from "@/components/sections/Testimonials";
import { WritingPreview } from "@/components/sections/WritingPreview";
import { ContactCTA } from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <SelectedWork />
      <Capabilities />
      <AINativeSignature />
      <ExperienceTimeline />
      <Testimonials />
      <WritingPreview />
      <ContactCTA />
    </>
  );
}
