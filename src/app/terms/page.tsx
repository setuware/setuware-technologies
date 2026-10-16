export const dynamic = "force-dynamic";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Setuware Technologies Terms of Service.",
};

export default function TermsPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert text-gray-400 max-w-none">
          <p className="mb-6 leading-relaxed">
            Welcome to Setuware Technologies. By accessing or using our
            website and services, you agree to these Terms of Service.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Use of Services</h2>
          <p className="mb-6 leading-relaxed">
            You may use our services for lawful purposes only. You agree not
            to misuse our website or services in any way that could harm
            others or violate applicable laws.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
          <p className="mb-6 leading-relaxed">
            All content on this website, including text, images, logos, and
            designs, is the property of Setuware Technologies and is protected
            by copyright and trademark laws.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
          <p className="mb-6 leading-relaxed">
            Setuware Technologies is not liable for any indirect, incidental,
            or consequential damages arising from the use of our services.
          </p>
          <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
          <p className="mb-6 leading-relaxed">
            If you have any questions about these Terms, please contact us at
            hello@setuware.com.
          </p>
        </div>
      </div>
    </div>
  );
}
