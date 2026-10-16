"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Code2,
  Layers,
  Rocket,
  Mail,
  ChevronRight,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Features", href: "#features" },
  { name: "About", href: "#about" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-indigo-950/90 backdrop-blur-md border-b border-white/5 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="#home"
            className="flex items-center gap-2 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Setuware
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-400 transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <Link
              href="#contact"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.3)]"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden text-white"
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
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
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
            className="fixed inset-y-0 right-0 z-50 w-full md:w-80 bg-indigo-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col py-8 px-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Setuware
                </span>
              </div>
              <button
                className="text-gray-300 hover:text-white"
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
                    className="block py-3 text-lg font-medium text-gray-200 hover:text-white hover:pl-2 transition-all"
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
                className="block w-full text-center py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-lg font-medium transition-all shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:scale-105"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>

              <div className="flex gap-4 justify-center">
                <a
                  href="https://github.com/setuware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/setuware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/setuware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
