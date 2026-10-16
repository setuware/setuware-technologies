"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Users,
  Award,
  Mail,
  Globe as GlobeIcon,
  Clock as ClockIcon,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Projects Delivered", icon: <Code2 className="w-6 h-6" /> },
  { value: "200+", label: "Happy Clients", icon: <Users className="w-6 h-6" /> },
  { value: "8+", label: "Years Experience", icon: <Award className="w-6 h-6" /> },
  { value: "15+", label: "Countries Served", icon: <GlobeIcon className="w-6 h-6" /> },
  { value: "24/7", label: "Support Available", icon: <ClockIcon className="w-6 h-6" /> },
  { value: "99%", label: "Client Retention", icon: <Mail className="w-6 h-6" /> },
];

export function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">About Setuware</h2>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed">
              Setuware Technologies is a forward-thinking digital agency
              dedicated to building exceptional web experiences. We combine
              creative design with robust engineering to deliver products that
              not only look stunning but perform flawlessly.
            </p>
            <p className="text-lg text-gray-400 leading-relaxed">
              Our team of experts specializes in modern web technologies,
              AI integration, and scalable architecture. We work closely with
              startups and enterprises to turn ideas into market-ready
              products.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-center font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Work With Us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.value}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl border border-white/10 bg-gray-900/30 flex flex-col items-center text-center"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-white/5 text-indigo-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
