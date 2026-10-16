export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Setuware Technologies and our mission.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 z-50 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Setuware</span>
          </a>
        </div>
      </nav>

      <div className="pt-20 max-w-7xl mx-auto px-6 py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 text-balance">
          About Setuware Technologies
        </h1>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-lg text-gray-400 leading-relaxed">
              Setuware Technologies was founded with a vision to build
              exceptional digital experiences that drive business growth. We
              believe that great technology should be accessible, beautiful,
              and performant.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Our team combines creative design with robust engineering to
              deliver products that not only look stunning but perform
              flawlessly across all devices and platforms.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              From early-stage startups to enterprise organizations, we help
              our clients turn ideas into market-ready products with speed and
              quality.
            </p>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-gray-900/50">
              <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
              <p className="text-gray-400 text-sm">
                To empower businesses with cutting-edge digital solutions that
                scale.
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-gray-900/50">
              <h3 className="text-xl font-bold text-white mb-2">Our Values</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Excellence in everything we build
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Client-first approach
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Continuous innovation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-400">✓</span> Transparent communication
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
