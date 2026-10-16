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
    color: "from-blue-500 to-purple-600",
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

export function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            All services under one roof
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital solutions to transform your business from
            idea to market leader.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br {service.color} shadow-lg shadow-blue-500/20">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {service.description}
              </p>
              <div className="space-y-2">
                {service.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-3xl p-8 md:p-12 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
              A refined process built on clarity
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "Discovery",
                  desc: "Understanding your goals and requirements",
                },
                {
                  step: "Design",
                  desc: "Creating user-centered interfaces",
                },
                {
                  step: "Development",
                  desc: "Building production-ready code",
                },
                {
                  step: "Testing",
                  desc: "Quality assurance and bug fixes",
                },
                {
                  step: "Deployment",
                  desc: "Launching to production",
                },
                {
                  step: "Support",
                  desc: "Ongoing maintenance and updates",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">
                      {item.step}
                    </h4>
                    <p className="text-sm text-gray-300">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
