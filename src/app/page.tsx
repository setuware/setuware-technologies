import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Features } from "@/components/sections/features";
import { About } from "@/components/sections/about";
import { Pricing } from "@/components/sections/pricing";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { Newsletter } from "@/components/sections/newsletter";

export const metadata = {
  title: "Setuware Technologies — Next-Gen Digital Solutions",
  description:
    "Next-gen digital solutions for startups and enterprises. Web development, AI solutions, UI/UX design, and more.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 selection:bg-indigo-500/30">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Features />
        <About />
        <Pricing />
        <Newsletter />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
