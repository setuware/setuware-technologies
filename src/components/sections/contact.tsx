"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email",
    value: "hello@setuware.com",
    href: "mailto:hello@setuware.com",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location",
    value: "San Francisco, CA",
    href: "https://maps.google.com",
  },
];

const socialLinks = [
  { icon: <Github className="w-5 h-5" />, label: "GitHub", href: "https://github.com/setuware" },
  { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "https://linkedin.com/company/setuware" },
  { icon: <Twitter className="w-5 h-5" />, label: "Twitter", href: "https://twitter.com/setuware" },
];

export function Contact() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed">
              Have a project in mind? Let's build something amazing together.
              Reach out to us and we'll get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.title === "Location" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{item.title}</div>
                    <div className="text-base font-medium text-white">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-gray-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl border border-white/10 bg-gray-900/50 shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                // TODO: Connect to backend API
                console.log("Form submitted:", data);
                alert("Thank you for your message! We'll get back to you soon.");
                e.currentTarget.reset();
              }}
              className="space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Website Development"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Tell us about your project..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-[0_10px_15px_-3px_rgba(99,102,241,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(99,102,241,0.3)] hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
