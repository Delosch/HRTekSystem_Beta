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
              <Link to="/aboutUsPage" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/careersPage" className="hover:text-white">
                Careers
              </Link>
            </li>
            <li>
              <Link to="/blogPage" className="hover:text-white">
                Blogs
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-white">
                Pricing
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
              <Link to="/roadmapServicePage" className="hover:text-white">
                HR Transformation Roadmap Generator
              </Link>
            </li>
            <li>
              <Link to="/hcmServicePage" className="hover:text-white">
                HCM Vendor Fit Engine
              </Link>
            </li>
            <li>
              <Link to="/sharedServicePage" className="hover:text-white">
                Shared Service Designer
              </Link>
            </li>
            <li>
              <Link to="/matAnalysisServicePage" className="hover:text-white">
                Advanced HR Maturity Analysis
              </Link>
            </li>
            <li>
              <Link to="/changeMgmtServicePage" className="hover:text-white">
                Emotionally Intelligent Change Management
              </Link>
            </li>
            <li>
              <Link to="/hrtechAdvisoryServicePage" className="hover:text-white">
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
                alt="LinkedIn link"
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
