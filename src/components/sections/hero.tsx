"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Code2,
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  Sparkles,
} from "lucide-react";

const statItems = [
  { label: "Projects Completed", value: "500+" },
  { label: "Happy Clients", value: "200+" },
  { label: "Years Experience", value: "8+" },
  { label: "Countries Served", value: "15+" },
];

export function Hero() {
  return (
    <section id="home" className="relative pt-20 pb-32 overflow-hidden">
      <div className="gradient-mesh" />
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Now accepting new projects for 2026
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-balance">
              We build{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                digital experiences
              </span>{" "}
              that scale
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed">
              Setuware Technologies crafts high-performance web applications,
              AI-powered solutions, and digital products for startups and
              enterprises. From concept to launch, we deliver pixel-perfect
              experiences with cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-medium px-8 shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.3)] hover:from-indigo-700 hover:to-purple-700 transition-all group">
                Start Your Project <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex h-12 w-full sm:w-auto items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-white text-lg font-medium px-8 hover:bg-white/10 transition-all">
                View Case Studies <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {statItems.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  className="p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative h-[500px] w-full flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-2xl" />
              <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl">
                <div className="rounded-xl bg-indigo-950/40 border border-white/10 p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: <Code2 className="w-5 h-5 text-indigo-400" />, label: "Web Apps" },
                      { icon: <Layers className="w-5 h-5 text-purple-400" />, label: "Design" },
                      { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, label: "Security" },
                      { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: "Performance" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                        {item.icon}
                        <span className="text-sm text-gray-300 font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-600/20 to-pink-500/20 border border-white/10 animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
              <Globe className="absolute top-1/4 right-1/4 w-24 h-24 text-indigo-400/30 animate-pulse" />
              <Rocket className="absolute bottom-1/4 left-1/4 w-24 h-24 text-purple-400/30 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
