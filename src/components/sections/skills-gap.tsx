"use client";

import { motion } from "framer-motion";

export function SkillsGap() {
  return (
    <section id="skills" className="py-24 bg-blue-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              This is how we hack over the skills gap.
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed mb-6">
              We bridge the gap between your vision and technical execution.
              Our team brings expertise across the full stack, so you don't
              have to worry about the complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg">
                Learn More
              </button>
              <button className="flex-1 py-4 bg-transparent border border-blue-500 text-blue-100 rounded-xl font-semibold hover:bg-blue-500/10 transition-all">
                Get Started
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[400px] w-full flex items-center justify-center"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl">
              <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900 p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <h3 className="text-white font-bold">Setuware</h3>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-3 rounded-full bg-blue-600/50 animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
