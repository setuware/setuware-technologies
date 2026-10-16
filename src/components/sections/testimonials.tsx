"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechStart",
    rating: 5,
    text:
      "Setuware transformed our idea into a production-ready product in record time. Their attention to detail is unmatched.",
    image: "/testimonials/sarah.jpg",
  },
  {
    name: "Marcus Johnson",
    role: "CTO, FinFlow",
    rating: 5,
    text:
      "The team at Setuware delivered a world-class mobile app that exceeded our expectations. Highly recommended.",
    image: "/testimonials/marcus.jpg",
  },
  {
    name: "Elena Rodriguez",
    role: "Founder, HealthAI",
    rating: 5,
    text:
      "From design to deployment, Setuware handled everything professionally. Our users love the new platform.",
    image: "/testimonials/elena.jpg",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real words, real people
          </h2>
          <p className="text-lg text-gray-600">
            Hear what our clients have to say about working with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: testimonials.indexOf(t) * 0.1 }}
              className="p-8 rounded-2xl bg-white border border-gray-100"
            >
              <div className="flex items-center gap-2 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={i <= t.rating ? "fill-yellow-400" : "text-gray-200"}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
