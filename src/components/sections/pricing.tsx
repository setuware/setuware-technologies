"use client";

import { motion } from "framer-motion";

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small projects and startups getting started.",
    features: [
      "1 Website",
      "Up to 5 Pages",
      "Basic SEO",
      "Email Support",
      "1 Revision",
      "1 Month Maintenance",
    ],
    cta: "Get Started",
    popular: false,
    color: "from-indigo-500 to-purple-600",
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "For growing businesses that need more power and features.",
    features: [
      "3 Websites",
      "Up to 15 Pages",
      "Advanced SEO",
      "Priority Email Support",
      "3 Revisions",
      "3 Months Maintenance",
      "Analytics Dashboard",
    ],
    cta: "Start Now",
    popular: true,
    color: "from-purple-500 to-fuchsia-600",
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/month",
    description: "Full-scale solutions for large organizations and teams.",
    features: [
      "Unlimited Websites",
      "Unlimited Pages",
      "Enterprise SEO",
      "24/7 Dedicated Support",
      "Unlimited Revisions",
      "12 Months Maintenance",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    color: "from-emerald-500 to-teal-600",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. All plans include
            our full suite of features and support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: pricingPlans.indexOf(plan) * 0.1 }}
              className={`relative p-8 rounded-2xl border border-white/10 bg-gray-900/50 transition-all duration-300 ${
                plan.popular
                  ? "border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)] scale-105"
                  : "hover:border-indigo-500/30 hover:-translate-y-2"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                    Most Popular
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-8">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 rounded-xl text-white font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.3)]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
