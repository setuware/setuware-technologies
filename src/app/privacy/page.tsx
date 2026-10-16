import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Setuware Technologies Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="fixed top-0 z-50 w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Setuware</span>
          </a>
        </div>
      </nav>

      <div className="pt-20 max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert text-gray-400 max-w-none">
          <p className="mb-6 leading-relaxed">
            At Setuware Technologies, we are committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, and
            safeguard your information when you visit our website or use our
            services.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
          <p className="mb-6 leading-relaxed">
            We may collect personal information such as your name, email
            address, and phone number when you submit our contact form or
            subscribe to our newsletter.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
          <p className="mb-6 leading-relaxed">
            We use your information to respond to your inquiries, send
            newsletters, and improve our services. We do not sell your
            personal information to third parties.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
          <p className="mb-6 leading-relaxed">
            If you have any questions about this Privacy Policy, please
            contact us at hello@setuware.com.
          </p>
        </div>
      </div>
    </div>
  );
}
