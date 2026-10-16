"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C-4.422 18.27-3.933 17.7-3.933 17.7c-1.311-.91.002-.904.002-.904 1.204.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-1.332-.89-.615 0-.887 0-.887 1.054 0 1.588 1.09 1.588 1.09 1.37 2.116 3.077 1.505 3.077 1.505 1.597-1.174 3.226-.668 3.226-.668 2.096.242 3.93 1.597 3.93 1.597.675-1.011 1.17-2.292 1.575-2.82-.935-.558-1.91-.867-2.91-.896-3.07-.244-6.204 1.277-6.204 5.287 0 1.09.454 2.06 1.174 2.774.494.284.995.432 1.534.432 1.562 0 2.79-1.284 2.79-1.284-.425-.928-.676-2.03-.676-2.03-.547-.272-.91-.647-1.31-.987-1.71-.595-3.61.09-3.61.09-.128.28-.205.62-.205.973 0 .319.227.684.838.784 3.182 1.177 6.037 1.824 9.194 1.824 3.157 0 6.012-.647 9.193-1.824.61-.1.837-.465.837-.784 0-.353-.077-.693-.205-.973 0-.221-.075-.434-.205-.652 2.394.544 4.928.085 6.896-1.478.984-.761 1.58-1.915 1.58-3.123 0-6.627-5.374-12-12-12"/></svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 0v11z"/></svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
);

const footerLinks = {
  Company: ["About", "Services", "Features", "Pricing", "Careers", "Blog"],
  Product: ["Web Development", "Mobile Apps", "AI & ML", "UI/UX Design", "Cloud & DevOps", "Cybersecurity"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "License Agreement"],
};

export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-white/10 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="pt-12 pb-8 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Setuware
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
              Building high-performance digital experiences for startups and
              enterprises. From concept to launch, we deliver excellence.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/setuware"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <GithubIcon />
              </a>
              <a
                href="https://linkedin.com/company/setuware"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <LinkedinIcon />
              </a>
              <a
                href="https://twitter.com/setuware"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-300 hover:bg-indigo-500 hover:text-white transition-all"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-6 uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={`#${link.toLowerCase()}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            © {year} Setuware Technologies. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
