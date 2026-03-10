import { useEffect, useState, useCallback } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    badge: "Agentic AI-Powered Platform",
    heading: "Turning HR Complexity into",
    highlight: "Cognitive Clarity",
    sub: "Smart software that upgrades your HR ecosystem — intelligently and at scale.",
    img: "/assets/homepageAssets/scroll0/images/heroImg3.png",
    alt: "HR AI platform visual",
    imgSize: "clamp(440px, 78vh, 820px)",
  },
  {
    badge: "Real-Time AI Execution",
    heading: "Design a",
    highlight: "Better HR System",
    sub: "Automate workflows, empower teams, and drive measurable growth.",
    img: "/assets/homepageAssets/scroll0/images/heroImg.png",
    alt: "HR product interface",
    imgSize: "clamp(440px, 78vh, 820px)",
  },
  {
    badge: "Enterprise-Ready",
    heading: "Transform Your",
    highlight: "HR Ecosystem",
    sub: "End-to-end transformation intelligence for CHROs and HR leaders.",
    img: "/assets/homepageAssets/scroll0/images/heroImg2.png",
    alt: "HR ecosystem transformation",
    imgSize: "clamp(360px, 62vh, 700px)",
  },
];

const TOTAL_SLIDES = slides.length;

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? TOTAL_SLIDES - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === TOTAL_SLIDES - 1 ? 0 : prev + 1));
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(135deg, #001845 0%, #023e8a 55%, #0077b6 100%)",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Subtle glow orb top-right */}
      <div
        className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full blur-[130px] z-0 opacity-30"
        style={{ background: "rgba(0,181,226,0.5)" }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] z-0 opacity-20"
        style={{ background: "rgba(0,119,182,0.8)" }}
      />

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="relative z-10 flex items-center w-full"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >
          <div
            className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-4 lg:gap-8 items-center w-full py-10 lg:py-14">

              {/* Left: Text */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-5"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide">
                    {slide.badge}
                  </span>
                </div>

                {/* Heading */}
                <div className="space-y-1">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                    {slide.heading}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mt-1">
                      {slide.highlight}
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base font-medium text-white/70 leading-relaxed max-w-md mx-auto lg:mx-0 mt-3">
                    {slide.sub}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-[#001845] font-bold text-sm sm:text-base rounded-xl shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-105"
                  >
                    Get Started Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/contact/demo"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-300"
                  >
                    Book a Demo
                  </Link>
                </div>
              </motion.div>

              {/* Right: Image — dominates the right column */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
                className="relative flex items-end justify-center w-full"
              >
                {/* Soft glow under image */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-24 blur-[50px] rounded-full z-0"
                  style={{ background: "rgba(0,181,226,0.25)" }}
                />

                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="relative z-10 w-full h-auto object-contain object-bottom"
                  style={{
                    maxHeight: slide.imgSize,
                    filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.45))",
                  }}
                />
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-sm text-white transition-all duration-300 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Pill indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`block rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "w-7 h-2 bg-white shadow-md shadow-white/30"
                : "w-2 h-2 bg-white/35 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-5 right-5 z-20 text-white/35 text-[11px] font-mono font-bold tracking-widest select-none">
        {String(currentIndex + 1).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
      </div>
    </div>
  );
}
