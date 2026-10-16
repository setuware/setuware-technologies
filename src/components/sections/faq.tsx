"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What services does Setuware offer?",
    answer:
      "We offer web development, mobile app development, AI/ML solutions, UI/UX design, cloud & DevOps, and cybersecurity services.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Project timelines vary based on complexity. A simple website takes 1-2 weeks, while a full-stack application typically takes 4-8 weeks.",
  },
  {
    question: "Do you provide post-launch support?",
    answer:
      "Yes, we offer ongoing maintenance and support packages to ensure your product stays up-to-date and performs well.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "We work with Next.js, React, TypeScript, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, and many more modern technologies.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Absolutely! We love working with startups and help them build MVPs, secure funding, and scale their products.",
  },
  {
    question: "What is your pricing model?",
    answer:
      "We offer flexible pricing based on project scope - fixed price for defined projects and hourly rates for ongoing work.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Have questions? We've got answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-gray-900 font-medium text-base hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <AnimateHeight show={isOpen}>
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                    {faq.answer}
                  </div>
                </AnimateHeight>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AnimateHeight({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={show ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
