
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
    "px-4 py-2 text-[#0B2A57] font-medium border-b-2 border-white bg-white rounded-[6px]";
  const inactiveStyle =
    "px-4 py-2 text-white hover:text-gray-900 hover:bg-gray-200 transition rounded-[6px]";

  const servicePaths = [
    "/roadmapServicePage",
    "/hcmServicePage",
    "/matAnalysisServicePage",
    "/sharedServicePage",
    "/changeMgmtServicePage",
  ];

  return (
    <div className="relative z-[9999]">
      <nav className="relative bg-[#03045e] p-4 border-b border-transparent flex flex-wrap justify-between items-center gap-4 [box-shadow:_0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-sm">
        {/* Left section: Nav Links */}
        <div className="flex items-center space-x-6 flex-wrap">
          <div className="flex space-x-4 flex-wrap">
            <Link to="/">
              <img
                src="/logoFinal.png"
                alt="Company Logo"
                className="h-10 w-auto mr-2 rounded-3xl"
              />
            </Link>
            <Link to="/">
              <button
                className={
                  pathname === "/" && hash !== "#services"
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

            <button
              onClick={handleServicesClick}
              className={`${servicePaths.includes(pathname) ? activeStyle : inactiveStyle
                } relative group`}
            >
              Services
              {/* Dropdown */}
              <div
                className="absolute left-0 mt-3 w-80 bg-white text-[#03045e] rounded-xl shadow-lg ring-1 ring-black/5
             opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
             origin-top transition-all duration-200 ease-out z-[999999]"
              >
                <ul className="py-2">
                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/roadmapServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <Map className="w-9 h-9 text-gray-600" />
                      <span>Auto-generated HR Digital Roadmap & ROI</span>
                    </Link>
                  </li>

                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/hcmServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <Puzzle className="w-6 h-6 text-gray-600" />
                      <span>Cognitive HCM Vendor Fit Engine</span>
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/matAnalysisServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <FileBarChart2 className="w-7 h-7 text-gray-600" />
                      <span>AI-driven HR Tech Diagnostics</span>
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/sharedServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <DraftingCompass className="w-6 h-6 text-gray-600" />
                      <span>Shared Services Operating Model Planner</span>
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/changeMgmtServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <Shapes className="w-10 h-10 text-gray-600" />
                      <span>Intelligent Change Management Systems to Enhance Execution</span>
                    </Link>
                  </li>
                  <li className="px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150">
                    <Link
                      to="/hrtechAdvisoryServicePage"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-x-3 px-5 py-3 hover:bg-[#f0f4ff] cursor-pointer transition-colors duration-150"
                    >
                      <Lightbulb className="w-6 h-6 text-gray-600" />
                      <span>HR Tech Advisory Services</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </button>

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
                  hash === "#contact" ? activeStyle : inactiveStyle
                }
              >
                Contact Us
              </button>
            </a>
          </div>
        </div>

        {/* Right section: Login | Signup */}
        <Link to="/auth">
          <button
            className="px-6 py-2 rounded-full bg-white border border-white text-[#03045e] 
              font-medium [box-shadow:_0_4px_4px_rgba(0,0,0,0.25)]
              hover:bg-[#03045e] hover:text-white transition-colors duration-200"
          >
            Login | SignUp
          </button>
        </Link>
      </nav>
    </div>
  );
}
