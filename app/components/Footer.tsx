import React from "react";
import { Link } from "@remix-run/react";
import Logo from "./ui/Logo";
import { Linkedin, Twitter, Facebook, ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B2A57] text-white py-10">
      <div className="mx-auto px-6 grid gap-8 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {/* Company Info */}
        <div className="flex flex-col items-start gap-4">
          <Logo orientation="stacked" />
          <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
            Empowering HR transformation through intelligent software solutions
            tailored for growth.
          </p>
          <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
            A Brand of Delosch Technologies Pvt Ltd
          </span>
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
              <Link to="/articles" className="hover:text-white">
                Articles
              </Link>
            </li>
            <li>
              <Link to="/discover-more" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 mt-2 transition-all group">
                Discover More
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
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
          <h3 className="text-lg font-semibold mb-6">Contact</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-cyan-400" />
              <a href="mailto:support@hrteksystem.com" className="hover:text-white transition-colors">support@hrteksystem.com</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span className="hover:text-white transition-colors">+91 9335870619, 0522-3195292</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-cyan-400 mt-1" />
              <span className="hover:text-white transition-colors">Lucknow, Uttar Pradesh, India</span>
            </li>
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

        {/* Legal & Privacy */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <Link to="/legal/privacy" className="hover:text-white flex items-center gap-2">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/legal/cookie" className="hover:text-white flex items-center gap-2">
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link to="/legal/gdpr" className="hover:text-white flex items-center gap-2">
                GDPR Compliance
              </Link>
            </li>
            <li className="pt-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
                }}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" /></svg>
                Cookie Settings
              </button>
            </li>
          </ul>
        </div>

        <div className="justify-self-start lg:justify-self-end">
          <h3 className="text-lg font-semibold mb-6">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://in.linkedin.com/company/hr-tek-system"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-cyan-500 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all duration-300 group"
            >
              <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </a>
            <a
              href="https://twitter.com/hrtek_system"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-black hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 group"
            >
              <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </a>
            <a
              href="https://facebook.com/hrteksystem"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 group"
            >
              <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
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
    </footer >
  );
}
