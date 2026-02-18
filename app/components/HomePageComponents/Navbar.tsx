import { Link, useLocation, useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";
import {
  Map,
  Puzzle,
  DraftingCompass,
  Shapes,
  FileBarChart2,
  Lightbulb,
  ChevronDown,
  User,
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const rootData = useRouteLoaderData("root") as { user: any } | undefined;
  const user = rootData?.user;
  const { pathname, hash } = location;
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileEnginesOpen, setIsMobileEnginesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll to services section if hash exists
  useEffect(() => {
    if (pathname === "/" && hash === "#services") {
      const element = document.getElementById("services");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, hash]);

  // Reset mobile states when menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileEnginesOpen(false);
    }
  }, [isMobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleServicesClick = () => {
  navigate("/#services");
  setIsMobileMenuOpen(false);
};


  const toggleServicesDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsServicesOpen(!isServicesOpen);
  };

  // Active and inactive button styles
  const activeStyle =
    "px-6 py-2 text-[#000033] font-bold bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 transform scale-105";
  const inactiveStyle =
    "px-6 py-2 text-white/90 hover:text-[#000033] hover:bg-white rounded-lg transition-all duration-300 font-semibold tracking-wide transform hover:scale-105";

  const mobileActiveStyle = "w-full text-left px-4 py-3 text-white font-bold bg-white/10 rounded-xl";
  const mobileInactiveStyle = "w-full text-left px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all";

  const servicePaths = [
    "/roadmap-service",
    "/hcm-service",
    "/maturity-analysis-service",
    "/shared-service",
    "/change-management-service",
    "/hrtech-advisory-service",
  ];

  const serviceItems = [
    { to: "/roadmap-service", icon: Map, label: "HR Digital Roadmap", color: "blue" },
    { to: "/hcm-service", icon: Puzzle, label: "HCM Vendor Fit", color: "purple" },
    { to: "/maturity-analysis-service", icon: FileBarChart2, label: "HR Tech Diagnostics", color: "green" },
    { to: "/shared-service", icon: DraftingCompass, label: "Shared Services", color: "amber" },
    { to: "/change-management-service", icon: Shapes, label: "Change Management", color: "rose" },
    { to: "/hrtech-advisory-service", icon: Lightbulb, label: "HR Tech Advisory", color: "yellow" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <nav className="relative bg-[#000033] px-6 md:px-8 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl backdrop-blur-md">
        {/* Left: Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
            <img
              src="/logo_icon_final.png"
              alt="HR-Tek"
              className="h-full w-auto object-contain transform group-hover:scale-110 transition-transform drop-shadow-lg"
              style={{ mixBlendMode: 'normal' }}
            />
          </div>
          <div className="flex flex-col">
            {pathname === "/" ? (
              <div className="text-xl md:text-2xl font-black tracking-tighter leading-none">
                <span className="text-white">HR-TEK</span>{" "}
                <span className="text-[#00B5E2]">SYSTEM</span>
              </div>
            ) : (
              <div className="text-xl md:text-2xl font-black tracking-tighter leading-none">
                <span className="text-white">HR-TEK</span>{" "}
                <span className="text-[#00B5E2]">SYSTEM</span>
              </div>
            )}
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-2 ml-10">
          <Link
            to="/"
            className={pathname === "/" && !hash ? activeStyle : inactiveStyle}
          >
            Home
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleServicesDropdown}
              className={`${(servicePaths.includes(pathname) || hash === "#services") ? activeStyle : inactiveStyle} flex items-center gap-1`}
            >
              Engines
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
              className={`absolute left-0 mt-3 w-80 bg-white text-[#03045e] rounded-2xl shadow-2xl ring-1 ring-black/5
              origin-top transition-all duration-300 ease-out z-[999999]
              ${isServicesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
              <ul className="py-3">
                {serviceItems.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsServicesOpen(false)}
                    >
                      <div className={`bg-${item.color}-100 p-2 rounded-lg`}>
                        <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.label}</p>
                        <p className="text-[10px] text-gray-500">
                          {idx === 0 ? "Auto-generated & ROI-focused" :
                            idx === 1 ? "Cognitive Selection Engine" :
                              idx === 2 ? "AI-driven Maturity Assessment" :
                                idx === 3 ? "Operating Model Planner" :
                                  idx === 4 ? "Intelligent Execution Systems" : "Expert Strategic Guidance"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link
            to="/pricing"
            className={pathname === "/pricing" ? activeStyle : inactiveStyle}
          >
            Pricing
          </Link>

          <Link
            to="/articles"
            className={pathname === "/articles" ? activeStyle : inactiveStyle}
          >
            Articles
          </Link>

          <Link
            to="/about-us"
            className={pathname === "/about-us" ? activeStyle : inactiveStyle}
          >
            About Us
          </Link>
          

          

          
          <Link
            to="/contact"
            className={pathname === "/contact" ? activeStyle : inactiveStyle}
          >
            Contact Us
          </Link>
        </div>

        {/* Right: Action Button & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-4 hover:bg-white/5 p-1 px-2 rounded-xl transition-all duration-300"
                >
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-white text-sm font-bold">{user.first_name} {user.last_name}</span>
                    <span className="text-[#00B5E2] text-[10px] font-medium uppercase tracking-wider">{user.role || 'Member'}</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </button>

                <div
                  className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 z-[99999] 
                  origin-top-right transition-all duration-300 flex flex-col items-stretch ring-1 ring-black/5
                  ${isUserDropdownOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                >
                  <Link to="/dashboard" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors font-bold text-sm">
                    <div className="bg-blue-100 p-1.5 rounded-lg"><User className="w-4 h-4 text-blue-600" /></div>
                    Dashboard
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <Link to="/logout" onClick={() => setIsUserDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-bold text-sm">
                    <div className="bg-red-100 p-1.5 rounded-lg"><LogOut className="w-4 h-4 text-red-600" /></div>
                    Logout
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth?mode=login"
                  className="px-6 py-2.5 rounded-full bg-white text-[#000033] font-bold text-sm shadow-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white"
                >
                  Login
                </Link>

                <Link
                  to="/auth?mode=signup"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00B5E2] to-[#0077b6] text-white font-bold text-sm shadow-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>

            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-xl transition-all relative z-[10001]"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-8 h-8 text-white transition-transform duration-300" />
            ) : (
              <Menu className="w-8 h-8 text-white transition-transform duration-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu - Enhanced modern glassmorphism drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-[10000]">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#000033]/60 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              ></motion.div>

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 right-0 w-[80%] max-w-sm h-screen bg-[#000033] shadow-2xl border-l border-white/10 flex flex-col p-8 pt-24"
              >
                <div className="flex flex-col space-y-2 overflow-y-auto pb-10">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-xl font-bold py-3 transition-colors ${pathname === "/" && !hash ? 'text-[#00B5E2]' : 'text-white hover:text-[#00B5E2]'}`}
                  >
                    Home
                  </Link>

                  <div className="pt-4 border-t border-white/10 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsMobileEnginesOpen(!isMobileEnginesOpen)}
                      className="w-full flex items-center justify-between py-3 text-xl font-bold text-white hover:text-[#00B5E2] transition-colors"
                    >
                      Engines
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileEnginesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isMobileEnginesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-4 py-4 pl-4 border-l border-white/10 mt-2">
                            {serviceItems.map((item, idx) => (
                              <Link
                                key={idx}
                                to={item.to}
                                className={`flex items-center gap-4 py-2 transition-all ${pathname === item.to ? 'text-[#00B5E2] translate-x-1' : 'text-white/70 hover:text-white hover:translate-x-1'}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className={`p-2 rounded-lg bg-white/5`}>
                                  <item.icon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-sm">{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-2 flex flex-col space-y-2">
                    <Link
                      to="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-xl font-bold py-3 transition-colors ${pathname === "/pricing" ? 'text-[#00B5E2]' : 'text-white hover:text-[#00B5E2]'}`}
                    >
                      Pricing
                    </Link>
                  </div>

                  <Link
                    to="/articles"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-xl font-bold py-3 transition-colors ${pathname === "/articles" ? 'text-[#00B5E2]' : 'text-white hover:text-[#00B5E2]'}`}
                  >
                    Articles
                  </Link>

                  <Link
                    to="/about-us"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-xl font-bold py-3 transition-colors ${pathname === "/about-us" ? 'text-[#00B5E2]' : 'text-white hover:text-[#00B5E2]'}`}
                  >
                    About Us
                  </Link>

                  <div className="pt-4 border-t border-white/10 mt-2 flex flex-col space-y-2">
                    <Link
                      to="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-xl font-bold py-3 transition-colors ${pathname === "/contact" ? 'text-[#00B5E2]' : 'text-white hover:text-[#00B5E2]'}`}
                    >
                      Contact Us
                    </Link>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/10">
                    {user ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{user.first_name} {user.last_name}</p>
                            <p className="text-[#00B5E2] text-[10px] font-medium uppercase tracking-wider">{user.role || 'Member'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 py-4 bg-white text-[#000033] rounded-xl font-bold shadow-lg"
                          >
                            <User className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link
                            to="/logout"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 py-4 border border-red-500/30 text-red-500 rounded-xl font-bold"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Link
                          to="/auth?mode=login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center py-4 bg-white text-[#000033] font-bold rounded-xl shadow-lg"
                        >
                          Login
                        </Link>

                        <Link
                          to="/auth?mode=signup"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center py-4 bg-gradient-to-r from-[#00B5E2] to-[#0077b6] text-white font-black rounded-xl shadow-lg"
                        >
                          Sign Up
                        </Link>
                      </div>

                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}
