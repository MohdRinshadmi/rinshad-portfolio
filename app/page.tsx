import { Hero } from "@/components/sections/Hero";
import { SocialProof } from "@/components/sections/SocialProof";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Experience } from "@/components/sections/Experience";
import { HowIWork } from "@/components/sections/HowIWork";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Projects />
      <Skills />
      <Experience />
      <HowIWork />
      <BlogPreview />
      <About />
      <Contact />
    </>
  );
}
