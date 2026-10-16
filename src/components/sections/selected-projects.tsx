"use client";

import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

const projects = [
  {
    title: "E-Commerce Platform",
    description:
      "Full-stack e-commerce solution with Next.js, Stripe integration, and admin dashboard.",
    image: "/projects/ecommerce.jpg",
    category: "Web Development",
    tech: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind CSS"],
    url: "/projects/ecommerce",
    featured: true,
  },
  {
    title: "AI Chatbot Assistant",
    description:
      "Intelligent customer support chatbot using OpenAI GPT-4 and vector embeddings.",
    image: "/projects/chatbot.jpg",
    category: "AI & ML",
    tech: ["Next.js", "OpenAI", "Pinecone", "Node.js", "TypeScript"],
    url: "/projects/chatbot",
    featured: true,
  },
  {
    title: "FinTech Mobile App",
    description:
      "Cross-platform banking app with real-time transactions and biometric authentication.",
    image: "/projects/fintech.jpg",
    category: "Mobile Apps",
    tech: ["React Native", "Firebase", "TypeScript", "Redux"],
    url: "/projects/fintech",
    featured: false,
  },
  {
    title: "SaaS Analytics Dashboard",
    description:
      "Real-time analytics platform with data visualization and custom reporting.",
    image: "/projects/analytics.jpg",
    category: "Web Development",
    tech: ["Next.js", "Chart.js", "PostgreSQL", "Prisma", "Tailwind CSS"],
    url: "/projects/analytics",
    featured: false,
  },
];

export function SelectedProjects() {
  return (
    <section id="projects" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Selected Projects
          </h2>
          <p className="text-lg text-gray-600">
            A glimpse of our work across industries and technologies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: projects.indexOf(project) * 0.1 }}
              className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-blue-500/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative mb-6">
                <div className="h-48 rounded-xl bg-gray-200 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white uppercase tracking-tighter">
                  {project.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs border border-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <LinkExternal href={project.url}>
                <button className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500 transition-all">
                  View Project <span className="ml-1">→</span>
                </button>
              </LinkExternal>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-500 transition-all">
            View All Projects
          </button>
        </div>
      </div>
    </section>
  );
}

function LinkExternal({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {children}
    </a>
  );
}
