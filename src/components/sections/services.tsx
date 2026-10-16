"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Layers,
  Rocket,
  ShieldCheck,
  Zap,
  Database,
  Brain,
  Smartphone,
} from "lucide-react";

const services = [
  {
    title: "Web Development",
    description:
      "High-performance, scalable web applications built with Next.js, React, and modern TypeScript stacks.",
    icon: <Code2 className="w-6 h-6" />,
    features: ["Next.js & React", "TypeScript", "SEO Optimized", "Responsive"],
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Mobile Apps",
    description:
      "Cross-platform mobile applications with native performance using React Native and Flutter.",
    icon: <Smartphone className="w-6 h-6" />,
    features: ["React Native", "iOS & Android", "Offline Mode", "Push Notifications"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "AI & ML Solutions",
    description:
      "Intelligent automation, chatbots, and machine learning models tailored to your business needs.",
    icon: <Brain className="w-6 h-6" />,
    features: ["LLM Integration", "Computer Vision", "Predictive Analytics", "NLP"],
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    title: "UI/UX Design",
    description:
      "User-centered design with Figma, focusing on usability, accessibility, and beautiful interfaces.",
    icon: <Layers className="w-6 h-6" />,
    features: ["Figma Design", "Design Systems", "Prototyping", "Accessibility"],
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Cloud & DevOps",
    description:
      "Scalable infrastructure, CI/CD pipelines, and cloud deployment on AWS, Vercel, and GCP.",
    icon: <Database className="w-6 h-6" />,
    features: ["AWS & GCP", "CI/CD", "Docker & Kubernetes", "Serverless"],
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Cybersecurity",
    description:
      "Enterprise-grade security audits, penetration testing, and secure application architecture.",
    icon: <ShieldCheck className="w-6 h-6" />,
    features: ["Security Audits", "Penetration Testing", "Compliance", "Encryption"],
    color: "from-emerald-500 to-teal-500",
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Services() {
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Services
          </motion.h2>
          <motion.p
            className="text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Comprehensive digital solutions to transform your business from
            idea to market leader.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={itemVariants.hidden}
              whileInView={itemVariants.visible}
              viewport={{ once: true }}
              className="group relative p-8 rounded-2xl bg-gray-900/50 border border-white/10 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br {service.color} shadow-lg shadow-indigo-500/20">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <div className="space-y-2">
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
