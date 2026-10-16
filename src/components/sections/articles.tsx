"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const articles = [
  {
    title: "How industry-specific websites help businesses scale",
    description:
      "Discover how tailored web solutions drive growth and efficiency across different sectors.",
    image: "/articles/article1.jpg",
    date: "Oct 10, 2024",
    readTime: "5 min read",
  },
  {
    title: "The future of AI in web development",
    description:
      "Exploring how artificial intelligence is changing the way we build digital products.",
    image: "/articles/article2.jpg",
    date: "Sep 25, 2024",
    readTime: "7 min read",
  },
  {
    title: "Why responsive design matters in 2024",
    description:
      "A deep dive into mobile-first design principles and their impact on user experience.",
    image: "/articles/article3.jpg",
    date: "Sep 15, 2024",
    readTime: "4 min read",
  },
];

export function Articles() {
  return (
    <section id="articles" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Articles & insights
          </h2>
          <p className="text-lg text-gray-600">
            Latest thoughts on technology, design, and business growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {articles.map((article) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: articles.indexOf(article) * 0.1 }}
              className="group p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="h-40 rounded-xl bg-gray-200 overflow-hidden mb-6 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {article.description}
              </p>
              <Link
                href="/blog"
                className="text-sm font-medium text-blue-600 hover:underline mt-4 inline-block"
              >
                Read more →
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
