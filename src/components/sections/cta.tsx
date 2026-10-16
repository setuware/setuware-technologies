"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Have a challenge to solve or an idea to explore?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Let's build something amazing together. Share your requirements
            and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-lg font-medium px-8 shadow-[0_10px_15px_-3px_rgba(59,130,246,0.4)] hover:bg-blue-700 transition-all">
              <Rocket className="w-5 h-5" />
              Start Your Project
            </button>
            <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg font-medium px-8 hover:bg-gray-50 transition-all">
              Contact Us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
