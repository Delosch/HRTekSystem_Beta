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
  LogOut
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const rootData = useRouteLoaderData("root") as { user: any } | undefined;
  const user = rootData?.user;
  const { pathname, hash } = location;
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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

  const handleServicesClick = () => {
    if (pathname === "/") {
      navigate("#services");
    } else {
      navigate("/#services");
    }
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

  const servicePaths = [
    "/roadmap-service",
    "/hcm-service",
    "/maturity-analysis-service",
    "/shared-service",
    "/change-management-service",
    "/hrtech-advisory-service",
  ];

  return (
    <div className="relative z-[9999]">
      <nav className="relative bg-[#000033] px-8 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl backdrop-blur-md">
        {/* Left: Branding */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-14 h-14 overflow-hidden flex items-center justify-center">
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

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center space-x-2 ml-10">
          <Link to="/">
            <button
              className={
                pathname === "/" && !hash
                  ? activeStyle
                  : inactiveStyle
              }
            >
              Home
            </button>
          </Link>

          <Link to="/about-us">
            <button
              className={
                pathname === "/about-us"
                  ? activeStyle
                  : inactiveStyle
              }
            >
              About Us
            </button>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleServicesDropdown}
              className={`${(servicePaths.includes(pathname) || hash === "#services") ? activeStyle : inactiveStyle
                } flex items-center gap-1`}
            >
              Services
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Dropdown content */}
            <div
              className={`absolute left-0 mt-3 w-80 bg-white text-[#03045e] rounded-2xl shadow-2xl ring-1 ring-black/5
              origin-top transition-all duration-300 ease-out z-[999999]
              ${isServicesOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
            >
              <ul className="py-3">
                <li>
                  <Link
                    to="/roadmap-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Map className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">HR Digital Roadmap</p>
                      <p className="text-[10px] text-gray-500">Auto-generated & ROI-focused</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hcm-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Puzzle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">HCM Vendor Fit</p>
                      <p className="text-[10px] text-gray-500">Cognitive Selection Engine</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maturity-analysis-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileBarChart2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">HR Tech Diagnostics</p>
                      <p className="text-[10px] text-gray-500">AI-driven Maturity Assessment</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shared-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <DraftingCompass className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Shared Services</p>
                      <p className="text-[10px] text-gray-500">Operating Model Planner</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/change-management-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-rose-100 p-2 rounded-lg">
                      <Shapes className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Change Management</p>
                      <p className="text-[10px] text-gray-500">Intelligent Execution Systems</p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hrtech-advisory-service"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsServicesOpen(false)}
                  >
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">HR Tech Advisory</p>
                      <p className="text-[10px] text-gray-500">Expert Strategic Guidance</p>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Link to="/pricing">
            <button
              className={
                pathname === "/pricing" ? activeStyle : inactiveStyle
              }
            >
              Pricing
            </button>
          </Link>

          <Link to="/contact">
            <button
              className={
                pathname === "/contact" ? activeStyle : inactiveStyle
              }
            >
              Contact Us
            </button>
          </Link>
        </div>

        {/* Right: Action Button */}
        <div className="flex items-center gap-4">
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

              {/* User Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 z-[99999] 
                origin-top-right transition-all duration-300 flex flex-col items-stretch ring-1 ring-black/5
                ${isUserDropdownOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
              >
                <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                  <p className="text-gray-900 font-bold text-sm truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-blue-500 text-[10px] font-medium uppercase tracking-wider">{user.role || 'Member'}</p>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 transition-colors font-bold text-sm"
                >
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Dashboard
                </Link>

                <div className="h-px bg-gray-100 my-1"></div>

                <Link
                  to="/logout"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-bold text-sm"
                >
                  <div className="bg-red-100 p-1.5 rounded-lg">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  Logout
                </Link>
              </div>
            </div>
          ) : (
            <Link to="/auth">
              <button
                className="px-8 py-2.5 rounded-full bg-white text-[#000033] 
                  font-bold text-sm shadow-xl hover:bg-blue-50 transition-all duration-300 
                  transform hover:scale-105 active:scale-95 border border-white"
              >
                Login | SignUp
              </button>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
