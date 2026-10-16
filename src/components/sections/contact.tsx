"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const contactInfo = [
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email",
    value: "hello@setuwaresoftware.in",
    href: "mailto:hello@setuwaresoftware.in",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    title: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Location",
    value: "Bangalore, India",
    href: "https://maps.google.com",
  },
];

const socialLinks = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C-4.422 18.27-3.933 17.7-3.933 17.7c-1.311-.91.002-.904.002-.904 1.204.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-1.332-.89-.615 0-.887 0-.887 1.054 0 1.588 1.09 1.588 1.09 1.37 2.116 3.077 1.505 3.077 1.505 1.597-1.174 3.226-.668 3.226-.668 2.096.242 3.93 1.597 3.93 1.597.675-1.011 1.17-2.292 1.575-2.82-.935-.558-1.91-.867-2.91-.896-3.07-.244-6.204 1.277-6.204 5.287 0 1.09.454 2.06 1.174 2.774.494.284.995.432 1.534.432 1.562 0 2.79-1.284 2.79-1.284-.425-.928-.676-2.03-.676-2.03-.547-.272-.91-.647-1.31-.987-1.71-.595-3.61.09-3.61.09-.128.28-.205.62-.205.973 0 .319.227.684.838.784 3.182 1.177 6.037 1.824 9.194 1.824 3.157 0 6.012-.647 9.193-1.824.61-.1.837-.465.837-.784 0-.353-.077-.693-.205-.973 0-.221-.075-.434-.205-.652 2.394.544 4.928.085 6.896-1.478.984-.761 1.58-1.915 1.58-3.123 0-6.627-5.374-12-12-12"/></svg>
    ),
    label: "GitHub",
    href: "https://github.com/setuware",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 0v11z"/></svg>
    ),
    label: "LinkedIn",
    href: "https://linkedin.com/company/setuware",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
    ),
    label: "Twitter",
    href: "https://twitter.com/setuware",
  },
];

export function Contact() {
  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed">
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
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-500/50 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{item.title}</div>
                    <div className="text-base font-medium text-gray-900">{item.value}</div>
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
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
            className="p-8 rounded-2xl border border-gray-100 bg-gray-50 shadow-xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                console.log("Form submitted:", data);
                alert("Thank you for your message! We'll get back to you soon.");
                e.currentTarget.reset();
              }}
              className="space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Website Development"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us about your project..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-[0_10px_15px_-3px_rgba(59,130,246,0.4)] hover:bg-blue-700 hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.3)] transition-all"
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
