"use client";

import { motion } from "framer-motion";

const techTools = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "PostgreSQL",
  "AWS",
  "Vercel",
  "Stripe",
  "Firebase",
  "Docker",
  "Redis",
];

export function TechTools() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Built with the right tools
          </h3>
          <p className="text-lg text-gray-600">
            We leverage modern technologies to build scalable and maintainable
            solutions.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {techTools.map((tool) => (
            <motion.div
              key={tool}
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="text-sm font-medium text-gray-700">{tool}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
