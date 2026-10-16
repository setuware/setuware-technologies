"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const pricingPlans = [
  {
    name: "Website Build",
    price: "₹20,000",
    description: "Perfect for small business websites and landing pages.",
    features: [
      "1 Page Website",
      "Responsive Design",
      "Contact Form",
      "SEO Basic",
      "1 Week Delivery",
      "1 Revision",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Full-stack App Build",
    price: "₹50,000",
    description: "Complete web application with backend and database.",
    features: [
      "Multi-page Application",
      "User Authentication",
      "Dashboard & Admin",
      "API Integration",
      "2 Weeks Delivery",
      "3 Revisions",
      "1 Month Support",
    ],
    cta: "Start Now",
    popular: true,
  },
  {
    name: "Enterprise Engagement",
    price: "Custom",
    description: "Full-scale solutions for large organizations.",
    features: [
      "Custom Architecture",
      "Team Augmentation",
      "Dedicated Project Manager",
      "SLA Guarantee",
      "Ongoing Maintenance",
      "Unlimited Revisions",
      "24/7 Support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Flexible plans
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business needs. All plans include
            our full suite of features and support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => {
            const baseClasses =
              "relative p-8 rounded-2xl border border-gray-100 bg-white transition-all duration-300";
            const popularClasses = plan.popular
              ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-105"
              : "hover:border-blue-500/30 hover:-translate-y-2";
            const buttonClasses = plan.popular
              ? "w-full py-4 rounded-xl text-white font-semibold transition-all bg-blue-600 shadow-[0_10px_15px_-3px_rgba(59,130,246,0.4)] hover:bg-blue-700 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.3)]"
              : "w-full py-4 rounded-xl text-white font-semibold transition-all bg-white border border-gray-200 hover:bg-gray-50";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pricingPlans.indexOf(plan) * 0.1 }}
                className={cn(baseClasses, popularClasses)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full bg-blue-600 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-8">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={cn(buttonClasses)}>{plan.cta}</button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
