"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
      <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Stay updated with our latest insights
          </h2>
          <p className="text-gray-400">
            Subscribe to our newsletter for exclusive tech tips, case studies,
            and company updates.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold disabled:opacity-70 transition-all shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.3)]"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
              <ArrowRight className={`w-4 h-4 ml-2 ${
                status === "loading" ? "animate-spin" : ""
              }`} />
            </button>
          </form>
          {status === "success" && (
            <p className="text-emerald-400 text-sm mt-3">Thanks for subscribing!</p>
          )}
          {status === "error" && (
            <p className="text-destructive text-sm mt-3">Something went wrong. Please try again.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
