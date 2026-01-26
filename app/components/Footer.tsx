import React from "react";
import { Link } from "@remix-run/react";

export default function Footer() {
  return (
    <footer className="bg-[#0B2A57] text-white py-10">
      <div className="mx-auto px-6 grid gap-8 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {/* Company Info */}
        <div className="flex flex-col items-start gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-16 h-16 overflow-hidden flex items-center justify-center">
              <img
                src="/logo_icon_final.png"
                alt="HR-Tek"
                className="h-full w-auto object-contain transform group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter leading-none">
                <span className="text-white">HR-TEK</span>{" "}
                <span className="text-[#00B5E2]">SYSTEM</span>
              </h1>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                A Brand of Delosch Technologies Pvt Ltd
              </span>
            </div>
          </Link>
          <p className="text-sm text-gray-300 max-w-xs leading-relaxed">

            Empowering HR transformation through intelligent software solutions
            tailored for growth.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about-us" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-white">
                Blogs
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/testimonials" className="hover:text-white">
                Testimonials
              </Link>
            </li>
            <li>
              <Link to="/video-tutorials" className="hover:text-white">
                Video Tutorials
              </Link>
            </li>
            <li>
              <Link to="/recommendation" className="hover:text-white">
                Recommendations
              </Link>
            </li>
            <li>
              <a href="/legal/term" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="/legal/privacy" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/legal/cookie" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                Cookie Policy
              </a>
            </li>
            <li>
              <a href="/legal/gdpr" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                GDPR Compliance
              </a>
            </li>
          </ul>
        </div>

        {/* Navigation Service Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Services</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/roadmap-service" className="hover:text-white">
                HR Transformation Roadmap Generator
              </Link>
            </li>
            <li>
              <Link to="/hcm-service" className="hover:text-white">
                HCM Vendor Fit Engine
              </Link>
            </li>
            <li>
              <Link to="/shared-service" className="hover:text-white">
                Shared Service Designer
              </Link>
            </li>
            <li>
              <Link to="/maturity-analysis-service" className="hover:text-white">
                Advanced HR Maturity Analysis
              </Link>
            </li>
            <li>
              <Link to="/change-management-service" className="hover:text-white">
                Emotionally Intelligent Change Management
              </Link>
            </li>
            <li>
              <Link to="/hrtech-advisory-service" className="hover:text-white">
                HR Tech Advisory layer
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Email: support@hrteksystem.com</li>
            <li>Phone: +91 9335870619, 0522-3195292</li>
            <li>Address: Lucknow, Uttar Pradesh, India</li>
          </ul>
        </div>

        {/* Accreditations */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Accreditations</h3>
          <div className="space-y-4">
            {/* Startup India */}
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 group hover:bg-white/10 transition-colors cursor-default">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1">
                <img
                  src="/assets/certificates/startup_india_logo.png"
                  alt="Startup India Recognized"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Startup India</p>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">Certificate No.</span>
                  <span className="text-[10px] text-gray-300 font-mono font-medium">DIPP202318</span>
                </div>
              </div>
            </div>

            {/* Start In UP */}
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 group hover:bg-white/10 transition-colors cursor-default">
              <div className="w-12 h-12 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-100">
                <img
                  src="/assets/certificates/start_in_up_cert.jpg"
                  alt="Start In UP Registered"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Start In UP</p>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">Registration No.</span>
                  <span className="text-[10px] text-gray-300 font-mono font-medium leading-tight max-w-[120px] break-all">
                    R/STARTUP/UP/LKO/ 2025/000038500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="justify-self-end">
          {/* <-- only change: justify-self-end so this column sits at the right */}
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a
              href="https://in.linkedin.com/company/hr-tek-system"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition"
            >
              <img
                src="/assets/homepageAssets/linkInSite.png"
                alt="LinkedIn"
                className="w-5 h-5 object-contain"
              />
            </a>
            <a
              href="https://twitter.com/hrtek_system"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition"
            >
              <img
                src="/assets/homepageAssets/xSite.png"
                alt="X (Twitter)"
                className="w-5 h-5 object-contain"
              />
            </a>
            <a
              href="https://facebook.com/hrteksystem"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition"
            >
              <img
                src="/assets/homepageAssets/fbSite.png"
                alt="Facebook"
                className="w-5 h-5 object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-sm text-gray-400">
        <div className="flex justify-between items-center">
          <span className="text-left ml-6">© {new Date().getFullYear()} HR-Tek System. All rights reserved.</span>
          <span className="text-center">This website comes under the GDPR Laws</span>
          <span className="text-right mr-6">CIN - U62010UP2025PTC219986</span>
        </div>
      </div>
    </footer>
  );
}
