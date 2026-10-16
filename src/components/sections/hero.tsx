"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="relative pt-20 pb-24 overflow-hidden">
      <div className="gradient-mesh" />
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
              <Rocket className="w-4 h-4" />
              Now accepting new projects for 2026
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight text-balance">
              From ideas to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                production-ready software
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
              Setuware Technologies crafts high-performance web applications,
              AI-powered solutions, and digital products for startups and
              enterprises. From concept to launch, we deliver pixel-perfect
              experiences with cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-blue-600 text-white text-lg font-medium px-8 shadow-[0_10px_15px_-3px_rgba(59,130,246,0.4)] hover:bg-blue-700 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.3)] transition-all group">
                Start Your Project <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-lg font-medium px-8 hover:bg-gray-50 transition-all">
                View Case Studies
              </button>
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Projects Completed</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-500">Happy Clients</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">8+</div>
                <div className="text-sm text-gray-500">Years Experience</div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-500">Countries Served</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-[500px] w-full flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl blur-2xl" />
              <div className="relative z-10 rounded-2xl border border-gray-200 bg-white p-1 shadow-xl">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Web Apps</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                      </div>
                      <span className="text-sm text-gray-600 font-mobile font-medium">Design</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 8 8 10 8 10z"></path></svg>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Security</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Performance</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-600/10 to-pink-500/10 border border-gray-100 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
