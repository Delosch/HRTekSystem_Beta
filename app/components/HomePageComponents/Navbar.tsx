
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import {
  Map,
  Puzzle,
  DraftingCompass,
  Shapes,
  FileBarChart2,
  Lightbulb,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname, hash } = location;

  // Scroll to services section if hash exists
  useEffect(() => {
    if (pathname === "/" && hash === "#services") {
      const element = document.getElementById("services");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname, hash]);

  const handleServicesClick = () => {
    if (pathname === "/") {
      navigate("#services");
    } else {
      navigate("/#services");
    }
  };

  // Active and inactive button styles
  const activeStyle =
    "px-6 py-2 text-[#000033] font-bold bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 transform scale-105";
  const inactiveStyle =
    "px-6 py-2 text-white/90 hover:text-[#000033] hover:bg-white rounded-lg transition-all duration-300 font-semibold tracking-wide transform hover:scale-105";

  const servicePaths = [
    "/roadmapServicePage",
    "/hcmServicePage",
    "/matAnalysisServicePage",
    "/sharedServicePage",
    "/changeMgmtServicePage",
    "/hrtechAdvisoryServicePage",
  ];

  return (
    <div className="relative z-[9999]">
      <nav className="relative bg-[#000033] px-8 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl backdrop-blur-md">
        {/* Left: Branding */}
        <Link to="/" className="flex items-center gap-4 group">
          <div className="bg-white p-1 rounded-lg shadow-inner">
            <img
              src="/hrtek_logo.png"
              alt="HRTEK Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <span className="text-white font-black text-2xl tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
            HRTEK <span className="text-blue-400">SYSTEM</span>
          </span>
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

          <Link to="/aboutUsPage">
            <button
              className={
                pathname === "/aboutUsPage"
                  ? activeStyle
                  : inactiveStyle
              }
            >
              About Us
            </button>
          </Link>

          <div className="relative group">
            <button
              onClick={handleServicesClick}
              className={`${(servicePaths.includes(pathname) || hash === "#services") ? activeStyle : inactiveStyle
                } flex items-center gap-1`}
            >
              Services
            </button>
            {/* Dropdown content remains same */}
            <div
              className="absolute left-0 mt-3 w-80 bg-white text-[#03045e] rounded-2xl shadow-2xl ring-1 ring-black/5
              opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
              origin-top transition-all duration-300 ease-out z-[999999]"
            >
              <ul className="py-3">
                <li>
                  <Link
                    to="/roadmapServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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
                    to="/hcmServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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
                    to="/matAnalysisServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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
                    to="/sharedServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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
                    to="/changeMgmtServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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
                    to="/hrtechAdvisoryServicePage"
                    className="flex items-center gap-x-4 px-6 py-4 hover:bg-blue-50 transition-colors"
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

          <a href="/#contact">
            <button
              className={
                hash.includes("contact") ? activeStyle : inactiveStyle
              }
            >
              Contact Us
            </button>
          </a>
        </div>

        {/* Right: Action Button */}
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <button
              className="px-8 py-2.5 rounded-full bg-white text-[#000033] 
                font-bold text-sm shadow-xl hover:bg-blue-50 transition-all duration-300 
                transform hover:scale-105 active:scale-95 border border-white"
            >
              Login | SignUp
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
