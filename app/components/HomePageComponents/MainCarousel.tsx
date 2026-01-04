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
          {/* Slide 1 */}
          <div className="w-full flex-shrink-0">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                        <span className="text-white">
                          HR Digital Transformation-Now Autonomous with Agentic AI
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Everything you need is one powerful platform.
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl text-justify">
                      Our software is built to be your comprehensive partner in
                      transformation. Whether you're redefining HR functions,
                      designing shared service models, managing organizational
                      change, or building detailed transformation roadmaps, we
                      bring it all together in one seamless, intelligent
                      platform. No more fragmented tools or scattered efforts
                      just one solution to drive meaningful change.
                    </p>
                    <Link
                      to="/sales"
                      className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-semibold px-6 py-3 rounded-full transition shadow-md"
                    >
                      Join Us Today!
                    </Link>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/heroImg3.png"
                      alt="Multi-armed robot efficiently managing various HR tasks, conveying automation and all-in-one platform"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2 */}
          <div className="w-full flex-shrink-0">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                        <span className="text-white">
                          Build a Future-Ready Workforce with Real-Time AI Execution
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Automate Workflows, Empower Teams, and Drive Growth
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl text-justify">
                      Elevate your HR operations with our intuitive software
                      solution, designed to seamlessly guide your organization
                      through digital transformation. Powered by advanced
                      artificial intelligence and large language models (LLMs),
                      our platform simplifies complex HR processes, enabling
                      smarter, faster, and more efficient decision-making.
                    </p>
                    <Link
                      to="/sales"
                      className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-semibold px-6 py-3 rounded-full transition shadow-md"
                    >
                      Join Us Today!
                    </Link>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/heroImg.png"
                      alt="Product interface highlighting key HR features like HCM selection, Roadmap generation"
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3 */}
          <div className="w-full flex-shrink-0">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-16">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                        <span className="text-white">
                          Empower Your Workforce with Intelligent, Self-Optimizing HR Systems
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Leverage smart software to upgrade your HR
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl text-justify">
                      Instead of expanding your HR Transformation workforce, our
                      platform enables your current employees to take on new
                      responsibilities with ease. By streamlining tasks and
                      simplifying workflows, the software bridges skill gaps and
                      unlocks hidden potential within your team.
                    </p>
                    <Link
                      to="/sales"
                      className="inline-block bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] font-semibold px-6 py-3 rounded-full transition shadow-md"
                    >
                      Join Us Today!
                    </Link>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/heroImg2.png"
                      alt="Why hire more staff when HR software can streamline tasks and cut HR Transformation costs"
                      className="max-w-full h-auto"
                    />
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
            className={`w-3 h-3 rounded-full border border-white ${
              currentIndex === idx ? "bg-white" : "bg-transparent"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
