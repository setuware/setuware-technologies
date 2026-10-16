import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { About } from "@/components/sections/about";
import { IndustryStats } from "@/components/sections/industry-stats";
import { SelectedProjects } from "@/components/sections/selected-projects";
import { TechTools } from "@/components/sections/tech-tools";
import { Pricing } from "@/components/sections/pricing";
import { CTA } from "@/components/sections/cta";
import { SkillsGap } from "@/components/sections/skills-gap";
import { Testimonials } from "@/components/sections/testimonials";
import { Articles } from "@/components/sections/articles";
import { FAQ } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Setuware Technologies — Production-Ready Software",
  description:
    "Setuware Technologies builds production-ready software from ideas to deployment. Web applications, AI solutions, and digital products for modern businesses.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-500/20">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <IndustryStats />
        <SelectedProjects />
        <TechTools />
        <Pricing />
        <CTA />
        <SkillsGap />
        <Testimonials />
        <Articles />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
