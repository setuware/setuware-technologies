"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Blog", href: "#blog" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-md"
        }`}
        onScroll={handleScroll}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="#home"
            className="flex items-center gap-2 group"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-2xl font-bold tracking-tight text-blue-600">
              Setuware
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#contact"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-[0_10px_15px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.2)]"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-80 bg-white border-l border-gray-200 flex flex-col py-8 px-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-bold tracking-tight text-blue-600">
                Setuware
              </span>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  initial={navItemVariants.hidden}
                  animate={navItemVariants.visible}
                  transition={{ delay: 0.05 * navLinks.indexOf(link) }}
                >
                  <Link
                    href={link.href}
                    className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600 hover:pl-2 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name} <ChevronRight className="w-4 h-4 inline ml-1" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-8 space-y-4">
              <Link
                href="#contact"
                className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg text-lg font-medium transition-all shadow-[0_10px_15px_-3px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.2)] hover:bg-blue-700"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
