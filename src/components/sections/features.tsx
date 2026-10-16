"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Layers,
  Rocket,
  ShieldCheck,
  Zap,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description: "Optimized performance with edge caching, ISR, and instant page loads.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: "SEO Optimized",
    description: "Server-side rendering and static generation for maximum search engine visibility.",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    title: "Fully Responsive",
    description: "Pixel-perfect design that works flawlessly on all devices and screen sizes.",
    icon: <SmartphoneIcon className="w-6 h-6" />,
  },
  {
    title: "Enterprise Security",
    description: "Industry-standard security practices with data encryption and secure authentication.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
  {
    title: "Rapid Development",
    description: "Agile workflows and modern tooling to ship products faster than ever.",
    icon: <Rocket className="w-6 h-6" />,
  },
  {
    title: "24/7 Support",
    description: "Dedicated support team available around the clock for your peace of mind.",
    icon: <Clock className="w-6 h-6" />,
  },
];

function SmartphoneIcon({ className }: { className?: string }) {
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
      <rect width="7" height="12" x="8.5" y="6" rx="2" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-2xl border border-white/5 bg-gray-900/30 hover:border-indigo-500/50 hover:bg-gray-800/50 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
