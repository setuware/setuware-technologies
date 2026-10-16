"use client";

import { motion } from "framer-motion";

export function About() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">About Setuware</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
              Setuware Technologies is a forward-thinking digital agency
              dedicated to building exceptional web experiences. We combine
              creative design with robust engineering to deliver products that
              not only look stunning but perform flawlessly.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our team of experts specializes in modern web technologies, AI
              integration, and scalable architecture. We work closely with
              startups and enterprises to turn ideas into market-ready
              products.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-center font-semibold hover:bg-blue-700 transition-all shadow-lg"
              >
                Work With Us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            <motion.div
              key="stat1"
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center"
            >
              <div className="text-3xl font-bold text-gray-900">5+</div>
              <div className="text-sm text-gray-500 mt-1">Years Experience</div>
            </motion.div>
            <motion.div
              key="stat2"
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col items-center text-center"
            >
              <div className="text-3xl font-bold text-gray-900">25+</div>
              <div className="text-sm text-gray-500 mt-1">Projects Delivered</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
