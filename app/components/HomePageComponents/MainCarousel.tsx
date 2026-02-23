import { useEffect, useState } from "react";
import { Link } from "@remix-run/react";

const TOTAL_SLIDES = 3;

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev === TOTAL_SLIDES - 1 ? 0 : prev + 1));

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-[#023e8a] text-white overflow-hidden">
      <div className="w-full overflow-hidden relative">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {/* Slide 1 - Modern Professional Design */}
          <div className="w-full flex-shrink-0">
            <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Left Side: Content */}
                  <div className="space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-white/90 text-xs sm:text-sm font-medium">Agentic AI-Powered Platform</span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-4 text-center lg:text-left">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight px-2 sm:px-0">
                        Turning HR Digital Complexity into
                        <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          Cognitive Clarity
                        </span>
                      </h1>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Leverage smart software to upgrade your HR ecosystem
                      </p>
                    </div>

                    {/* Description - REMOVED */}



                    {/* CTA Button */}
                    <div className="flex justify-center lg:justify-start">
                      <Link
                        to="/auth"
                        className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-bold text-base sm:text-lg rounded-xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                      >
                        Join Us Today!
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>

                  {/* Right Side: Image */}
                  <div className="relative lg:h-[750px] flex items-center justify-center">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>

                    {/* Image Container */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src="/assets/homepageAssets/scroll0/images/heroImg3.png"
                        alt="Multi-armed robot efficiently managing various HR tasks"
                        className="w-full h-auto max-h-[400px] lg:max-h-[700px] object-contain drop-shadow-2xl transform scale-100 lg:scale-110 hover:scale-105 lg:hover:scale-115 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 - Modern Professional Design */}
          <div className="w-full flex-shrink-0">
            <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              <div className="relative max-w-7xl mx-auto px-6 py-10 lg:py-28 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Left Side: Content */}
                  <div className="space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-white/90 text-xs sm:text-sm font-medium">Real-Time AI Execution</span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-4 text-center lg:text-left">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight px-2 sm:px-0">
                        HR-Tek Helps to Design
                        <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          Better HR System
                        </span>
                      </h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Automate Workflows, Empower Teams, and Drive Growth
                      </p>
                    </div>

                    {/* Description - REMOVED */}


                    {/* CTA Button */}
                    <Link
                      to="/auth"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-bold text-lg rounded-xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Join Us Today!
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>

                  {/* Right Side: Image */}
                  <div className="relative lg:h-[750px] flex items-center justify-center">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>

                    {/* Image Container */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src="/assets/homepageAssets/scroll0/images/heroImg.png"
                        alt="Product interface highlighting key HR features"
                        className="w-full h-auto max-h-[400px] lg:max-h-[700px] object-contain drop-shadow-2xl transform scale-100 lg:scale-110 hover:scale-105 lg:hover:scale-115 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 - Modern Professional Design */}
          <div className="w-full flex-shrink-0">
            <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }}></div>
              </div>

              <div className="relative max-w-7xl mx-auto px-6 py-10 lg:py-28 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Left Side: Content */}
                  <div className="space-y-6 sm:space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-white/90 text-xs sm:text-sm font-medium">Enterprise-Friendly</span>
                    </div>

                    {/* Main Heading */}
                    <div className="space-y-4 text-center lg:text-left">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight px-2 sm:px-0">
                        Transform Your
                        <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          HR Ecosystem
                        </span>
                      </h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Leverage smart software to upgrade your HR ecosystem
                      </p>
                    </div>

                    {/* Description - REMOVED */}


                    {/* CTA Button */}
                    <Link
                      to="/auth"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-bold text-lg rounded-xl shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Join Us Today!
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>

                  {/* Right Side: Image */}
                  <div className="relative lg:h-[750px] flex items-center justify-center">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>

                    {/* Image Container */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src="/assets/homepageAssets/scroll0/images/heroImg2.png"
                        alt="Streamline HR tasks and reduce costs"
                        className="w-full h-auto max-h-[400px] lg:max-h-[700px] object-contain drop-shadow-2xl transform scale-100 lg:scale-110 hover:scale-105 lg:hover:scale-115 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Button */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
        aria-label="Previous Slide"
      >
        ‹
      </button>

      {/* Right Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl z-10"
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {[...Array(TOTAL_SLIDES)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full border border-white ${currentIndex === idx ? "bg-white" : "bg-transparent"
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
