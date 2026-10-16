"use client";

import { motion } from "framer-motion";
import { Code2, Users, Award, Globe as GlobeIcon, Clock as ClockIcon } from "lucide-react";

const stats = [
  { value: "500+", label: "Projects Delivered", icon: <Code2 className="w-6 h-6" /> },
  { value: "200+", label: "Happy Clients", icon: <Users className="w-6 h-6" /> },
  { value: "8+", label: "Years Experience", icon: <Award className="w-6 h-6" /> },
  { value: "15+", label: "Countries Served", icon: <GlobeIcon className="w-6 h-6" /> },
  { value: "24/7", label: "Support Available", icon: <ClockIcon className="w-6 h-6" /> },
  { value: "99%", label: "Client Retention", icon: <Award className="w-6 h-6" /> },
];

export function IndustryStats() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Software designed for your industry.
          </h2>
          <p className="text-xl text-gray-600">Built for your growth.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.value}
              whileHover={{ y: -4 }}
              className="p-8 rounded-2xl border border-gray-100 bg-white flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-50 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
