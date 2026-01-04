import { useState } from "react";

const cards = [
  {
    logo: "/assets/homepageAssets/scroll2/logo1.svg",
    title: "How JSW Transformed HR Service Delivery",
    author: "Swapnil Navalkar",
    role: "VP & Head HR - Digital & Analytics",
    authorImage: "/assets/homepageAssets/scroll3/square1/pp1.png",
  },
  {
    logo: "/assets/homepageAssets/scroll2/logo2.svg",
    title: "Orion Innovation Drives Global Workforce with Darwinbox",
    author: "Swapnil Navalkar",
    role: "VP & Head HR - Digital & Analytics",
    authorImage: "/assets/homepageAssets/scroll3/square2/pp2.png",
  },
  {
    logo: "/assets/homepageAssets/scroll2/logo3.svg",
    title: "Bringing Self-Service HR to 19,000 People at Straive",
    author: "Swapnil Navalkar",
    role: "VP & Head HR - Digital & Analytics",
    authorImage: "/assets/homepageAssets/scroll3/square3/pp3.png",
  },
  {
    logo: "/assets/homepageAssets/scroll2/logo4.svg",
    title: "Zeta Simplified Global HR Operations",
    author: "Swapnil Navalkar",
    role: "VP & Head HR - Digital & Analytics",
    authorImage: "/assets/homepageAssets/scroll3/square4/pp4.png",
  },
  {
    logo: "/assets/homepageAssets/scroll2/logo6.svg",
    title: "ITC Empowered HR Teams Across Locations Seamlessly",
    author: "Swapnil Navalkar",
    role: "VP & Head HR - Digital & Analytics",
    authorImage: "/assets/homepageAssets/scroll3/square5/pp5.png",
  },
];

export default function CustomerSuccessCarousel() {
  const [centerIndex, setCenterIndex] = useState(0);
  const total = cards.length;

  const getIndex = (offset: number) => (centerIndex + offset + total) % total;

  const fadeClass = (offset: number) => {
    switch (offset) {
      case 0:
        return "opacity-100 scale-100 z-30";
      case -1:
      case 1:
        return "opacity-60 scale-95 z-20";
      case -2:
      case 2:
        return "opacity-30 scale-90 z-10";
      default:
        return "hidden";
    }
  };

  const next = () => setCenterIndex((centerIndex + 1) % total);
  const prev = () => setCenterIndex((centerIndex - 1 + total) % total);

  return (
    <section className="py-20 bg-white text-center overflow-hidden">
      <h2 className="text-3xl text-black font-bold mb-24">
        Customer Success Stories
      </h2>

      {/* Carousel ribbon */}
      <div className="relative w-full max-w-6xl mx-auto flex items-center justify-center">
        <div className="relative w-[1000px] h-[320px] flex items-center justify-center">
          {[-2, -1, 0, 1, 2].map((offset) => {
            const idx = getIndex(offset);
            const card = cards[idx];
            const fade = fadeClass(offset);
            const translate = `translate-x-[${offset * 60}px]`; // optional

            return (
              <div
                key={offset}
                className={`absolute transition-all duration-30000 ease-in-out rounded-xl shadow-lg bg-white overflow-hidden ${fade}`}
                style={{
                  transform: `translateX(${offset * 300}px) scale(${
                    offset === 0
                      ? 1
                      : offset === -1 || offset === 1
                      ? 0.95
                      : 0.9
                  })`,
                  width: "260px",
                  height: "360px",
                  opacity:
                    offset === 0
                      ? 1
                      : offset === -1 || offset === 1
                      ? 0.6
                      : 0.3,
                  zIndex: 5 - Math.abs(offset),
                }}
              >
                <div className="flex flex-col h-full justify-between p-4">
                  {/* Logo */}
                  <div className="h-12 flex justify-start items-center">
                    <img
                      src={card.logo}
                      alt="logo"
                      className="h-full object-contain"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-grow mt-2 mb-2 overflow-hidden">
                    <h3 className="text-base font-semibold text-gray-800 line-clamp-4">
                      {card.title}
                    </h3>
                  </div>

                  {/* Author */}
                  <div className="flex items-center mt-2 mb-2 h-12">
                    <img
                      src={card.authorImage}
                      alt="author"
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <div className="text-xs text-gray-600 leading-tight">
                      <div className="font-semibold">{card.author}</div>
                      <div>{card.role}</div>
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="mt-auto pt-2">
                    <a
                      href="#"
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation + CTA */}
      <div className="mt-16 flex items-center justify-center space-x-6">
        <button onClick={prev} className=" p-3 bg-blue-600 rounded-full">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700">
          Read all Customer Stories →
        </button>

        <button onClick={next} className=" p-3 bg-blue-600 rounded-full">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
